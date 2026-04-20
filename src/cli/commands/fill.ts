import { resolve } from 'node:path'
import { Command } from 'commander'
import { findLacConfig, loadConfig } from '../../config.js'
import { readNodeFile, writeNodeFile } from '../../parser.js'
import { scanNodes, isEmpty, getNestedValue } from '../../utils.js'

// Prose fields that live as markdown sections in node.md
const PROSE_FIELDS = [
  'implementation', 'problem', 'successCriteria', 'rationale', 'choice',
  'impact', 'edgeCases', 'userGuide', 'supportNotes', 'escalationPath', 'rollback',
]

function buildFillPrompt(node: Record<string, unknown>, missingByView: Record<string, string[]>): string {
  const summary = `Node: ${String(node['id'])} (${String(node['type'])} — ${String(node['title'])})
Status: ${String(node['status'])}
Domain: ${String(node['domain'])}
Current views: ${JSON.stringify(node['views'] ?? {}, null, 2)}
`
  const needed = Object.entries(missingByView)
    .map(([v, fields]) => `  ${v}: ${fields.join(', ')}`)
    .join('\n')

  return `You are a technical writer helping document a software node.

${summary}
Fill in the missing fields below. Return a JSON object with this shape:
{
  "views": {
    "<viewId>": {
      "<fieldId>": "<value>"
    }
  }
}

Missing fields to fill:
${needed}

Rules:
- For prose fields (${PROSE_FIELDS.join(', ')}): write 2-5 clear sentences.
- For array fields (acceptanceCriteria, testCases, knownLimitations, steps, npmPackages): return a JSON array of strings.
- For scalar fields (componentFile, pmSummary, testStrategy, releaseVersion): return a concise string.
- Infer content from the existing title, domain, type, and any existing view fields.
- Return ONLY the JSON object, no explanation.`
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey })
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = msg.content[0]
  return block?.type === 'text' ? block.text : ''
}

function parseJsonResponse(text: string): Record<string, unknown> | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>
  } catch {
    return null
  }
}

export const fillCmd = new Command('fill')
  .description('AI-fill missing view fields using Claude')
  .argument('<id>', 'node id (partial match)')
  .option('--dir <dir>', 'workspace root', '.')
  .option('--api-key <key>', 'Anthropic API key (or set ANTHROPIC_API_KEY)')
  .option('--dry-run', 'print the prompt without calling the API')
  .action(async (id: string, opts: { dir: string; apiKey?: string; dryRun?: boolean }) => {
    const root = resolve(opts.dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }
    const config = loadConfig(configPath)

    const paths = scanNodes(root)
    const nodePath = paths.find((p) => p.includes(id))
    if (!nodePath) {
      console.error(`Node not found: ${id}`)
      process.exit(1)
    }

    const node = readNodeFile(nodePath)
    if (!node) {
      console.error(`Failed to parse node: ${nodePath}`)
      process.exit(1)
    }

    const typeDef = config.types[node.type]
    const requiredViews = typeDef?.requiredViews ?? []

    // Find missing fields per required view
    const missingByView: Record<string, string[]> = {}
    for (const viewId of requiredViews) {
      const viewDef = config.views[viewId]
      if (!viewDef?.fields) continue
      const currentView = (node.views[viewId] ?? {}) as Record<string, unknown>
      const missing: string[] = []
      for (const [fieldId, fieldDef] of Object.entries(viewDef.fields)) {
        if (fieldDef.required && isEmpty(currentView[fieldId])) {
          missing.push(fieldId)
        }
      }
      if (missing.length > 0) missingByView[viewId] = missing
    }

    if (Object.keys(missingByView).length === 0) {
      console.log(`✓ ${node.id} — no missing required fields`)
      return
    }

    const prompt = buildFillPrompt(node as unknown as Record<string, unknown>, missingByView)

    if (opts.dryRun) {
      console.log('--- PROMPT ---')
      console.log(prompt)
      return
    }

    const apiKey = opts.apiKey ?? process.env['ANTHROPIC_API_KEY']
    if (!apiKey) {
      console.error('Anthropic API key required. Set ANTHROPIC_API_KEY or pass --api-key')
      process.exit(1)
    }

    console.log(`Filling ${Object.values(missingByView).flat().length} field(s) for ${node.id}...`)

    try {
      const raw = await callClaude(prompt, apiKey)
      const parsed = parseJsonResponse(raw)
      if (!parsed || typeof parsed['views'] !== 'object') {
        console.error('Claude returned unexpected format')
        console.error(raw)
        process.exit(1)
      }

      const filledViews = parsed['views'] as Record<string, Record<string, unknown>>
      const updatedViews: Record<string, Record<string, unknown>> = { ...node.views }
      for (const [viewId, fields] of Object.entries(filledViews)) {
        updatedViews[viewId] = { ...(updatedViews[viewId] ?? {}), ...fields }
      }

      const updated = { ...(node as unknown as Record<string, unknown>), views: updatedViews }
      writeNodeFile(nodePath, updated)
      console.log(`✓ Updated ${nodePath}`)
      for (const [v, fields] of Object.entries(missingByView)) {
        console.log(`  ${v}: ${fields.join(', ')}`)
      }
    } catch (err) {
      console.error(`API error: ${(err as Error).message}`)
      process.exit(1)
    }
  })
