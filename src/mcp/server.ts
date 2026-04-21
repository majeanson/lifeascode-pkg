import process from 'node:process'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { LacNodeSchema, LacStatusSchema } from '../schema.js'
import { findLacConfig, loadConfig } from '../config.js'
import { readNodeFile, writeNodeFile } from '../parser.js'
import { buildGraph } from '../graph.js'
import { advanceNode } from '../lifecycle.js'
import { scanNodes, generateId, getNestedValue, isEmpty } from '../utils.js'

const server = new Server(
  { name: 'lifeascode', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

function root(): string {
  return process.cwd()
}

function getConfigOrThrow() {
  const configPath = findLacConfig(root())
  if (!configPath) throw new Error('lac.config.json not found. Run "lac init" first.')
  return { config: loadConfig(configPath), configPath }
}

function findNodeById(id: string) {
  for (const p of scanNodes(root())) {
    const node = readNodeFile(p)
    if (node?.id === id) return { path: p, node }
    // Also allow partial id match
    if (node && p.includes(id)) return { path: p, node }
  }
  return null
}

function allNodes() {
  return scanNodes(root()).flatMap((p) => {
    const node = readNodeFile(p)
    return node ? [node] : []
  })
}

function applyDotPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let cur: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!
    if (!cur[key] || typeof cur[key] !== 'object' || Array.isArray(cur[key])) cur[key] = {}
    cur = cur[key] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]!] = value
}

function ok(text: string) {
  return { content: [{ type: 'text' as const, text }] }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'get_node_status', description: 'Get status and metadata of a node by ID', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Node ID (full or partial)' } }, required: ['id'] } },
    { name: 'summarize_workspace', description: 'Workspace health summary — counts by status, blocked nodes', inputSchema: { type: 'object', properties: {} } },
    { name: 'roadmap_view', description: 'Active and draft nodes sorted by priority — roadmap planning', inputSchema: { type: 'object', properties: { domain: { type: 'string', description: 'Optional domain filter' } } } },
    { name: 'create_node', description: 'Create a new node.md', inputSchema: { type: 'object', properties: { type: { type: 'string' }, title: { type: 'string' }, domain: { type: 'string' } }, required: ['type', 'title', 'domain'] } },
    { name: 'read_node_context', description: 'Read full node content — all views and relationships', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'write_node_fields', description: 'Update fields using dot-path notation (e.g. views.dev.implementation)', inputSchema: { type: 'object', properties: { id: { type: 'string' }, fields: { type: 'object', description: 'Map of dot-path → value' } }, required: ['id', 'fields'] } },
    { name: 'advance_node', description: 'Advance node status with validation (draft→active→frozen→deprecated)', inputSchema: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'status'] } },
    { name: 'fill_node', description: 'AI-fill empty required fields using Claude (requires ANTHROPIC_API_KEY; lists missing fields if key absent)', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'build_graph', description: 'Build .lac/graph.json and .lac/index.json from all nodes', inputSchema: { type: 'object', properties: {} } },
    { name: 'search_nodes', description: 'Full-text search across all nodes', inputSchema: { type: 'object', properties: { query: { type: 'string' }, type: { type: 'string' }, domain: { type: 'string' }, status: { type: 'string' } }, required: ['query'] } },
    { name: 'get_lineage', description: 'Get parent/child lineage of a node', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'audit_decisions', description: 'Audit all decision nodes for rationale completeness', inputSchema: { type: 'object', properties: {} } },
    { name: 'blame_file', description: 'Find nodes referencing a file path', inputSchema: { type: 'object', properties: { file: { type: 'string' } }, required: ['file'] } },
    { name: 'cross_node_impact', description: 'Find all nodes impacted by a given node', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'node_similarity', description: 'Find nodes similar to a given node (type + domain matching)', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'suggest_split', description: 'Analyze whether a node should be split into smaller nodes', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'node_changelog', description: 'Get status history of a node', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'spawn_child_node', description: 'Create a child node linked to a parent', inputSchema: { type: 'object', properties: { parentId: { type: 'string' }, type: { type: 'string' }, title: { type: 'string' } }, required: ['parentId', 'type', 'title'] } },
    { name: 'lock_node_fields', description: 'Lock specific fields on a node to prevent AI edits', inputSchema: { type: 'object', properties: { id: { type: 'string' }, fields: { type: 'array', items: { type: 'string' } }, reason: { type: 'string' } }, required: ['id', 'fields'] } },
    { name: 'node_summary_for_pr', description: 'Generate a PR description from a node (problem + implementation)', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    { name: 'next_action', description: 'What should I work on next? Analyzes workspace state and returns the single highest-priority next step with full context — great for starting a session.', inputSchema: { type: 'object', properties: { domain: { type: 'string', description: 'Optional: limit suggestion to a domain' } } } },
    { name: 'plan_session', description: 'Generate a ready-to-use Claude coding session briefing for implementing a feature. Pass a node ID or omit to auto-select the next unbuilt feature.', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Node ID (optional — omit to auto-pick highest priority draft feature)' } } } },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params

  try {
    switch (name) {
      case 'get_node_status': {
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const { node } = found
        return ok(JSON.stringify({ id: node.id, type: node.type, title: node.title, status: node.status, domain: node.domain, priority: node.priority, tags: node.tags, blockedBy: node.blockedBy, children: node.children }, null, 2))
      }

      case 'summarize_workspace': {
        const nodes = allNodes()
        const counts: Record<string, number> = { draft: 0, active: 0, frozen: 0, deprecated: 0 }
        let blocked = 0
        const byType: Record<string, number> = {}
        for (const n of nodes) {
          counts[n.status]++
          byType[n.type] = (byType[n.type] ?? 0) + 1
          if (n.blockedBy?.length) blocked++
        }
        return ok(JSON.stringify({ total: nodes.length, ...counts, blocked, byType }, null, 2))
      }

      case 'roadmap_view': {
        const nodes = allNodes()
          .filter((n) => ['draft', 'active'].includes(n.status) && (!args['domain'] || n.domain === args['domain']))
          .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.title.localeCompare(b.title))
          .map((n) => ({ id: n.id, type: n.type, title: n.title, status: n.status, domain: n.domain, priority: n.priority }))
        return ok(JSON.stringify(nodes, null, 2))
      }

      case 'create_node': {
        const { configPath } = getConfigOrThrow()
        const id = generateId(args['type'] as string, args['title'] as string)
        const nodeDir = join(dirname(configPath), 'nodes', args['domain'] as string, id)
        mkdirSync(nodeDir, { recursive: true })
        const node = { id, type: args['type'], title: args['title'], status: 'draft', domain: args['domain'], schemaVersion: 2, views: {} }
        writeNodeFile(join(nodeDir, 'node.md'), node as Record<string, unknown>)
        return ok(`Created node ${id}: ${args['title'] as string}\nNext: read_node_context to see what fields to fill`)
      }

      case 'read_node_context': {
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const { config } = getConfigOrThrow()
        const { node } = found
        const typeDef = config.types[node.type]
        const missing: string[] = []
        for (const viewId of typeDef?.requiredViews ?? []) {
          const viewDef = config.views[viewId]
          for (const [fieldId] of Object.entries(viewDef?.fields ?? {})) {
            if (isEmpty(getNestedValue(node, `views.${viewId}.${fieldId}`))) {
              missing.push(`views.${viewId}.${fieldId}`)
            }
          }
        }
        const result = { node, missingFields: missing, nextAction: missing.length === 0 ? 'advance_node to move to next status' : `Fill missing fields with write_node_fields: ${missing.slice(0, 3).join(', ')}` }
        return ok(JSON.stringify(result, null, 2))
      }

      case 'write_node_fields': {
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const fields = args['fields'] as Record<string, unknown>
        const updated = structuredClone(found.node) as unknown as Record<string, unknown>
        for (const [path, value] of Object.entries(fields)) {
          applyDotPath(updated, path, value)
        }
        writeNodeFile(found.path, updated)
        return ok(`Updated ${Object.keys(fields).length} field(s) on ${args['id'] as string}`)
      }

      case 'advance_node': {
        const { config } = getConfigOrThrow()
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const statusParsed = LacStatusSchema.safeParse(args['status'])
        if (!statusParsed.success) return ok(`Invalid status: ${args['status'] as string}`)
        const result = advanceNode(found.node, statusParsed.data, config)
        if (!result.ok || !result.node) return ok(`Error: ${result.error}`)
        const updated = result.node as unknown as Record<string, unknown>
        if (args['reason']) {
          const history = (updated['statusHistory'] as Array<Record<string, unknown>>) ?? []
          const last = history[history.length - 1]
          if (last) last['reason'] = args['reason']
        }
        writeNodeFile(found.path, updated)
        return ok(`Advanced ${args['id'] as string}: ${found.node.status} → ${statusParsed.data}`)
      }

      case 'fill_node': {
        const { config } = getConfigOrThrow()
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const { node } = found
        const typeDef = config.types[node.type]
        const missingByView: Record<string, string[]> = {}
        for (const viewId of typeDef?.requiredViews ?? []) {
          const viewDef = config.views[viewId]
          const currentView = (node.views[viewId] ?? {}) as Record<string, unknown>
          const missing: string[] = []
          for (const [fieldId] of Object.entries(viewDef?.fields ?? {})) {
            if (isEmpty(getNestedValue(node, `views.${viewId}.${fieldId}`))) missing.push(fieldId)
          }
          if (missing.length > 0) missingByView[viewId] = missing
        }
        if (Object.keys(missingByView).length === 0) return ok('All required fields filled.')
        const apiKey = process.env['ANTHROPIC_API_KEY']
        if (!apiKey) {
          const list = Object.entries(missingByView).flatMap(([v, fs]) => fs.map((f) => `views.${v}.${f}`))
          return ok(`Missing fields (set ANTHROPIC_API_KEY to auto-fill):\n${list.map((f) => `• ${f}`).join('\n')}`)
        }
        const PROSE = ['implementation','problem','successCriteria','rationale','choice','impact','edgeCases','userGuide','supportNotes','escalationPath','rollback']
        const needed = Object.entries(missingByView).map(([v, fs]) => `  ${v}: ${fs.join(', ')}`).join('\n')
        const prompt = `You are a technical writer. Fill missing fields for this node.\n\nNode: ${node.id} (${node.type} — ${node.title})\nStatus: ${node.status}\nDomain: ${node.domain}\nCurrent views: ${JSON.stringify(node.views, null, 2)}\n\nReturn JSON:\n{ "views": { "<viewId>": { "<fieldId>": "<value>" } } }\n\nMissing fields:\n${needed}\n\nRules:\n- Prose fields (${PROSE.join(', ')}): 2-5 clear sentences.\n- Array fields (acceptanceCriteria, testCases, knownLimitations, steps): JSON array of strings.\n- Scalar fields (componentFile, testStrategy): concise string.\n- Return ONLY the JSON object.`
        try {
          const Anthropic = (await import('@anthropic-ai/sdk')).default
          const client = new Anthropic({ apiKey })
          const msg = await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 2048, messages: [{ role: 'user', content: prompt }] })
          const text = msg.content[0]?.type === 'text' ? msg.content[0].text : ''
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (!jsonMatch) return ok('Claude returned unexpected format.')
          const parsed = JSON.parse(jsonMatch[0]) as { views?: Record<string, Record<string, unknown>> }
          if (!parsed.views) return ok('Claude returned unexpected format.')
          const updatedViews: Record<string, Record<string, unknown>> = { ...node.views }
          for (const [viewId, fields] of Object.entries(parsed.views)) {
            updatedViews[viewId] = { ...(updatedViews[viewId] ?? {}), ...fields }
          }
          writeNodeFile(found.path, { ...(node as unknown as Record<string, unknown>), views: updatedViews })
          const filled = Object.values(missingByView).flat()
          return ok(`Filled ${filled.length} field(s): ${filled.join(', ')}`)
        } catch (err) {
          return ok(`AI fill error: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      case 'build_graph': {
        const { graph, errors } = buildGraph(root())
        return ok(`Built: ${graph.nodes.length} nodes, ${graph.edges.length} edges, ${graph.meta.domains.length} domains${errors.length ? `\n${errors.length} error(s): ${errors.join(', ')}` : ''}`)
      }

      case 'search_nodes': {
        const q = (args['query'] as string).toLowerCase()
        const results = allNodes()
          .filter((n) => {
            if (args['type'] && n.type !== args['type']) return false
            if (args['domain'] && n.domain !== args['domain']) return false
            if (args['status'] && n.status !== args['status']) return false
            return JSON.stringify(n).toLowerCase().includes(q)
          })
          .map((n) => ({ id: n.id, type: n.type, title: n.title, status: n.status, domain: n.domain }))
        return ok(results.length ? JSON.stringify(results, null, 2) : `No results for "${args['query'] as string}"`)
      }

      case 'get_lineage': {
        const nodes = allNodes()
        const target = nodes.find((n) => n.id === args['id'] || n.id.includes(args['id'] as string))
        if (!target) return ok(`Node not found: ${args['id']}`)
        const parent = target.parent ? nodes.find((n) => n.id === target.parent) : undefined
        const children = nodes.filter((n) => n.parent === target.id)
        return ok(JSON.stringify({ node: { id: target.id, title: target.title }, parent: parent ? { id: parent.id, title: parent.title } : null, children: children.map((c) => ({ id: c.id, title: c.title })) }, null, 2))
      }

      case 'audit_decisions': {
        const decisions = allNodes().filter((n) => n.type === 'decision')
        const audit = decisions.map((n) => ({
          id: n.id, title: n.title, status: n.status,
          hasChoice: !isEmpty(getNestedValue(n, 'views.dev.choice')),
          hasRationale: !isEmpty(getNestedValue(n, 'views.dev.rationale')),
        }))
        const incomplete = audit.filter((a) => !a.hasChoice || !a.hasRationale)
        return ok(JSON.stringify({ total: decisions.length, incomplete: incomplete.length, decisions: audit }, null, 2))
      }

      case 'blame_file': {
        const file = args['file'] as string
        const matches = allNodes()
          .filter((n) => JSON.stringify(n).includes(file))
          .map((n) => ({ id: n.id, type: n.type, title: n.title }))
        return ok(matches.length ? JSON.stringify(matches, null, 2) : `No nodes reference "${file}"`)
      }

      case 'cross_node_impact': {
        const id = args['id'] as string
        const impacted = allNodes()
          .filter((n) => {
            if (n.id === id) return false
            const refs = [...(n.blockedBy ?? []), ...(n.enables ?? []), ...(n.references ?? []), ...(n.children ?? [])]
            return refs.includes(id) || n.parent === id
          })
          .map((n) => ({ id: n.id, type: n.type, title: n.title }))
        return ok(impacted.length ? JSON.stringify(impacted, null, 2) : 'No impacted nodes found.')
      }

      case 'node_similarity': {
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const { node } = found
        const similar = allNodes()
          .filter((n) => n.id !== node.id)
          .map((n) => ({ id: n.id, title: n.title, type: n.type, domain: n.domain, score: (n.type === node.type ? 2 : 0) + (n.domain === node.domain ? 1 : 0) }))
          .filter((n) => n.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
        return ok(JSON.stringify(similar, null, 2))
      }

      case 'suggest_split': {
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const { node } = found
        const wordCount = JSON.stringify(node.views).split(/\s+/).length
        const childCount = node.children?.length ?? 0
        if (wordCount > 500 || childCount > 5) {
          return ok(`"${node.title}" may be too large (${wordCount} words in views, ${childCount} children). Consider splitting into smaller nodes.`)
        }
        return ok(`"${node.title}" looks well-scoped (${wordCount} words, ${childCount} children).`)
      }

      case 'node_changelog': {
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const history = found.node.statusHistory ?? []
        return ok(history.length ? JSON.stringify(history, null, 2) : 'No status history.')
      }

      case 'spawn_child_node': {
        const { configPath } = getConfigOrThrow()
        const parentFound = findNodeById(args['parentId'] as string)
        if (!parentFound) return ok(`Parent not found: ${args['parentId']}`)
        const id = generateId(args['type'] as string, args['title'] as string)
        const nodeDir = join(dirname(configPath), 'nodes', parentFound.node.domain, id)
        mkdirSync(nodeDir, { recursive: true })
        const child = { id, type: args['type'], title: args['title'], status: 'draft', domain: parentFound.node.domain, schemaVersion: 2, parent: args['parentId'], views: {} }
        writeNodeFile(join(nodeDir, 'node.md'), child as Record<string, unknown>)
        const parentUpdated = structuredClone(parentFound.node) as unknown as Record<string, unknown>
        applyDotPath(parentUpdated, 'children', [...(parentFound.node.children ?? []), id])
        writeNodeFile(parentFound.path, parentUpdated)
        return ok(`Created child node ${id} under ${args['parentId'] as string}`)
      }

      case 'lock_node_fields': {
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const now = new Date().toISOString()
        const newLocks = (args['fields'] as string[]).map((field) => ({
          field, lockedAt: now, lockedBy: 'lac-mcp', reason: args['reason'] as string | undefined,
        }))
        const updated = structuredClone(found.node) as unknown as Record<string, unknown>
        applyDotPath(updated, 'fieldLocks', [...((found.node.fieldLocks ?? []) as unknown[]), ...newLocks])
        writeNodeFile(found.path, updated)
        return ok(`Locked ${newLocks.length} field(s) on ${args['id'] as string}: ${(args['fields'] as string[]).join(', ')}`)
      }

      case 'node_summary_for_pr': {
        const found = findNodeById(args['id'] as string)
        if (!found) return ok(`Node not found: ${args['id']}`)
        const { node } = found
        const problem = getNestedValue(node, 'views.product.problem') as string | undefined
        const impl = getNestedValue(node, 'views.dev.implementation') as string | undefined
        const guide = getNestedValue(node, 'views.user.userGuide') as string | undefined
        const summary = [
          `## ${node.title}`,
          `**Type:** ${node.type}  |  **Status:** ${node.status}  |  **Domain:** ${node.domain}`,
          node.priority ? `**Priority:** P${node.priority}` : '',
          problem ? `\n### Problem\n${problem}` : '',
          impl ? `\n### Implementation\n${impl}` : '',
          guide ? `\n### User Guide\n${guide}` : '',
          `\n**Node ID:** \`${node.id}\``,
        ].filter(Boolean).join('\n')
        return ok(summary)
      }

      case 'next_action': {
        const { config } = getConfigOrThrow()
        const nodes = allNodes().filter((n) => !args['domain'] || n.domain === args['domain'])

        // 1. Draft nodes with zero fields filled → create or fill
        const emptyDrafts = nodes.filter((n) => n.status === 'draft' && Object.keys(n.views ?? {}).length === 0)
        if (emptyDrafts.length > 0) {
          const n = emptyDrafts.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))[0]!
          return ok(`**Next action: fill "${n.title}"**\n\nNode \`${n.id}\` is a ${n.type} in draft with no fields filled yet.\n\nRun: \`fill_node("${n.id}")\` to auto-fill required fields, or \`read_node_context("${n.id}")\` to see what's needed.\n\nThen: \`plan_session("${n.id}")\` to get a coding session briefing.`)
        }

        // 2. Active nodes with missing required fields → fill gaps
        const activeMissingFields: Array<{ id: string; title: string; missing: string[] }> = []
        for (const n of nodes.filter((n) => n.status === 'active')) {
          const typeDef = config.types[n.type]
          const missing: string[] = []
          for (const viewId of typeDef?.requiredViews ?? []) {
            const viewDef = config.views[viewId]
            for (const [fieldId, fieldDef] of Object.entries(viewDef?.fields ?? {})) {
              if ((fieldDef as Record<string, unknown>)['required'] && isEmpty(getNestedValue(n, `views.${viewId}.${fieldId}`))) {
                missing.push(`views.${viewId}.${fieldId}`)
              }
            }
          }
          if (missing.length > 0) activeMissingFields.push({ id: n.id, title: n.title, missing })
        }
        if (activeMissingFields.length > 0) {
          const top = activeMissingFields[0]!
          return ok(`**Next action: complete "${top.title}"**\n\nNode \`${top.id}\` is active but missing required fields:\n${top.missing.map((f) => `• ${f}`).join('\n')}\n\nRun: \`fill_node("${top.id}")\` to auto-fill, or \`write_node_fields\` to fill manually.\n\nThen: \`advance_node("${top.id}", "frozen")\` when all fields are complete.`)
        }

        // 3. Draft features with product view filled → ready to plan_session
        const readyToBuild = nodes.filter((n) => n.status === 'draft' && n.type === 'feature' && !isEmpty(getNestedValue(n, 'views.product.problem')))
          .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
        if (readyToBuild.length > 0) {
          const n = readyToBuild[0]!
          return ok(`**Next action: build "${n.title}"**\n\nNode \`${n.id}\` is planned and ready to implement.\n\nRun: \`plan_session("${n.id}")\` to get a full coding session briefing.\n\nWhen built: \`advance_node("${n.id}", "active")\``)
        }

        // 4. Active features → advance to frozen if complete
        const advanceable = nodes.filter((n) => n.status === 'active' && n.type === 'feature')
          .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
        if (advanceable.length > 0) {
          const n = advanceable[0]!
          return ok(`**Next action: review and freeze "${n.title}"**\n\nNode \`${n.id}\` is active. Check it's complete, then:\n\nRun: \`advance_node("${n.id}", "frozen")\` to mark it shipped.\n\nOr: \`read_node_context("${n.id}")\` to check for gaps first.`)
        }

        const total = nodes.length
        const frozen = nodes.filter((n) => n.status === 'frozen').length
        return ok(`Everything looks great! ${frozen}/${total} nodes are frozen.\n\nRun \`roadmap_view()\` to see the full picture, or create a new feature with \`create_node\`.`)
      }

      case 'plan_session': {
        const nodes = allNodes()

        // Pick target node
        let target = args['id'] ? nodes.find((n) => n.id === (args['id'] as string) || n.id.includes(args['id'] as string)) : undefined
        if (!target) {
          // Auto-pick: highest priority draft feature with product.problem filled
          target = nodes
            .filter((n) => n.status === 'draft' && n.type === 'feature' && !isEmpty(getNestedValue(n, 'views.product.problem')))
            .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))[0]
        }
        if (!target) {
          // Fallback: any draft feature
          target = nodes.filter((n) => n.status === 'draft' && n.type === 'feature').sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))[0]
        }
        if (!target) return ok('No draft features found. Create one with `create_node` first.')

        // Gather context
        const epic = nodes.find((n) => n.type === 'epic' && (target!.parent === n.id || n.children?.includes(target!.id)))
        const decisions = nodes.filter((n) => n.type === 'decision' && n.status === 'active')
        const epicProblem = epic ? getNestedValue(epic, 'views.product.problem') as string | undefined : undefined
        const problem = getNestedValue(target, 'views.product.problem') as string | undefined
        const criteria = getNestedValue(target, 'views.product.acceptanceCriteria') as string[] | undefined
        const componentFile = getNestedValue(target, 'views.dev.componentFile') as string | undefined
        const implementation = getNestedValue(target, 'views.dev.implementation') as string | undefined

        // Format active decisions as constraints
        const constraints = decisions
          .map((d) => {
            const choice = getNestedValue(d, 'views.dev.choice') as string | undefined
            return choice ? `- **${d.title}**: ${choice.split('\n')[0]}` : null
          })
          .filter(Boolean)
          .join('\n')

        const criteriaList = (criteria ?? []).map((c) => `- ${c}`).join('\n')

        const lines: string[] = [
          `# Build Session: ${target.title}`,
          ``,
          `## Project Context`,
          epic ? `You are building **${epic.title}**.` : 'You are working on a Quiet Minds game.',
          epicProblem ? `\n${epicProblem.trim()}` : '',
          ``,
          `## What You're Building`,
          `**${target.title}** — node \`${target.id}\``,
          problem ? `\n${problem.trim()}` : '',
          ``,
        ]

        if (criteriaList) {
          lines.push(`## Acceptance Criteria`, criteriaList, ``)
        }

        if (constraints) {
          lines.push(`## Design Constraints (active decisions)`, constraints, ``)
        }

        lines.push(
          `## Technical Details`,
          `- Component file: \`${componentFile ?? 'TBD — set views.dev.componentFile'}\``,
          `- Status: \`${target.status}\` → advance to \`active\` when implementation is in progress`,
          implementation ? `- Implementation notes: ${implementation.trim()}` : `- Implementation notes: not yet written — write as you build`,
          ``,
          `## Your Task`,
          `Implement this game as a self-contained React component.`,
          `Stack: React + Vite + TypeScript. No audio. No animation. Touch-friendly.`,
          ``,
          `When the component renders correctly:`,
          `\`\`\``,
          `advance_node("${target.id}", "active")`,
          `write_node_fields("${target.id}", { "views.dev.implementation": "describe what you built" })`,
          `\`\`\``,
          ``,
          `When the feature is fully complete and tested:`,
          `\`\`\``,
          `advance_node("${target.id}", "frozen")`,
          `\`\`\``,
        )

        return ok(lines.join('\n'))
      }

      default:
        return ok(`Unknown tool: ${name}`)
    }
  } catch (err) {
    return ok(`Error: ${err instanceof Error ? err.message : String(err)}`)
  }
})

async function startServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

startServer().catch(console.error)
