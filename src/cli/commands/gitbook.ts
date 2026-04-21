import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Command } from 'commander'
import { findLacConfig } from '../../config.js'
import { buildGraph } from '../../graph.js'
import type { LacNode } from '../../schema.js'

// ─── role → which views to include ───────────────────────────────────────────
type Role = 'user' | 'dev' | 'product' | 'support' | 'tester' | 'all'

const ROLE_VIEWS: Record<Role, string[]> = {
  user:    ['user', 'product'],
  dev:     ['dev', 'tester'],
  product: ['product'],
  support: ['support'],
  tester:  ['tester', 'dev'],
  all:     ['user', 'dev', 'product', 'support', 'tester'],
}

// ─── human-readable labels ────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  userGuide:          'How to Use',
  releaseNotes:       'Release Notes',
  knownLimitations:   'Known Limitations',
  workarounds:        'Workarounds',
  implementation:     'Implementation',
  edgeCases:          'Edge Cases',
  choice:             'Decision',
  rationale:          'Rationale',
  componentFile:      'Component File',
  npmPackages:        'npm Packages',
  codeSnippets:       'Code Snippets',
  problem:            'Problem',
  successCriteria:    'Success Criteria',
  acceptanceCriteria: 'Acceptance Criteria',
  metrics:            'Metrics',
  impact:             'Impact',
  supportNotes:       'Support Notes',
  escalationPath:     'Escalation Path',
  rollback:           'Rollback',
  testCases:          'Test Cases',
  expectedBehavior:   'Expected Behavior',
}

const VIEW_LABELS: Record<string, string> = {
  user:    'User Guide',
  dev:     'Developer',
  product: 'Product',
  support: 'Support',
  tester:  'Testing',
}

const TYPE_LABELS: Record<string, string> = {
  feature:  'Feature',
  bug:      'Bug',
  decision: 'Decision',
  epic:     'Epic',
  research: 'Research',
  runbook:  'Runbook',
  faq:      'FAQ',
  release:  'Release',
}

const TYPE_ICONS: Record<string, string> = {
  feature:  '⬡',
  bug:      '🐛',
  decision: '⚖',
  epic:     '◈',
  research: '🔬',
  runbook:  '📋',
  faq:      '❓',
  release:  '🏷',
}

// ─── render a single field value to markdown ─────────────────────────────────
function renderFieldValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map((item) => `* ${String(item)}`).join('\n')
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `**${k}:** ${String(v)}`)
      .join('\n')
  }
  return String(value ?? '')
}

// ─── render a single node as a GitBook page ──────────────────────────────────
function renderNodePage(node: LacNode, allNodes: LacNode[], role: Role): string {
  const lines: string[] = []
  const viewsToShow = ROLE_VIEWS[role]

  // GitBook frontmatter — description used as subtitle in nav
  const tagline = (node.views['product']?.['problem'] as string | undefined)?.split('\n')[0]
    ?? (node.views['user']?.['userGuide'] as string | undefined)?.split('\n')[0]
    ?? ''
  if (tagline) {
    lines.push('---')
    lines.push(`description: ${tagline.replace(/"/g, "'")}`)
    lines.push('---')
    lines.push('')
  }

  // Title
  const icon = TYPE_ICONS[node.type] ?? '◦'
  lines.push(`# ${icon} ${node.title}`)
  lines.push('')

  // Meta badges
  const metaParts: string[] = [
    `**Type:** ${TYPE_LABELS[node.type] ?? node.type}`,
    `**Status:** ${node.status.charAt(0).toUpperCase() + node.status.slice(1)}`,
    `**Domain:** ${node.domain}`,
  ]
  if (node.tags?.length) metaParts.push(`**Tags:** ${node.tags.join(', ')}`)
  if (node.priority) metaParts.push(`**Priority:** ${node.priority}`)
  lines.push(metaParts.join(' · '))
  lines.push('')
  lines.push('---')
  lines.push('')

  // Views — only include views in scope for this role
  let hasContent = false
  for (const viewId of viewsToShow) {
    const viewData = node.views[viewId]
    if (!viewData || Object.keys(viewData).length === 0) continue

    const viewLabel = VIEW_LABELS[viewId] ?? viewId
    let viewSectionAdded = false

    for (const [fieldId, fieldValue] of Object.entries(viewData)) {
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') continue
      if (Array.isArray(fieldValue) && fieldValue.length === 0) continue

      if (!viewSectionAdded) {
        lines.push(`## ${viewLabel}`)
        lines.push('')
        viewSectionAdded = true
        hasContent = true
      }

      const label = FIELD_LABELS[fieldId] ?? fieldId
      lines.push(`### ${label}`)
      lines.push('')
      lines.push(renderFieldValue(fieldValue))
      lines.push('')
    }
  }

  if (!hasContent) {
    lines.push('*This node has no content yet for the selected role.*')
    lines.push('')
  }

  // Relationships
  const relLines: string[] = []

  if (node.parent) {
    const parentNode = allNodes.find((n) => n.id === node.parent)
    const parentTitle = parentNode?.title ?? node.parent
    relLines.push(`**Inherits from:** [${parentTitle}](../${parentNode?.domain ?? node.domain}/${node.parent}.md)`)
  }

  const childNodes = allNodes.filter((n) => n.parent === node.id || node.children?.includes(n.id))
  if (childNodes.length > 0) {
    relLines.push(`**Children:**`)
    for (const c of childNodes) {
      relLines.push(`* [${c.title}](../${c.domain}/${c.id}.md)`)
    }
  }

  if (node.blockedBy?.length) {
    relLines.push(`**Blocked by:** ${node.blockedBy.map((id) => {
      const n = allNodes.find((x) => x.id === id)
      return `[${n?.title ?? id}](../${n?.domain ?? 'nodes'}/${id}.md)`
    }).join(', ')}`)
  }

  if (node.enables?.length) {
    relLines.push(`**Enables:** ${node.enables.map((id) => {
      const n = allNodes.find((x) => x.id === id)
      return `[${n?.title ?? id}](../${n?.domain ?? 'nodes'}/${id}.md)`
    }).join(', ')}`)
  }

  if (node.references?.length) {
    relLines.push(`**References:** ${node.references.map((id) => {
      const n = allNodes.find((x) => x.id === id)
      return `[${n?.title ?? id}](../${n?.domain ?? 'nodes'}/${id}.md)`
    }).join(', ')}`)
  }

  if (relLines.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Relationships')
    lines.push('')
    lines.push(...relLines)
    lines.push('')
  }

  return lines.join('\n')
}

// ─── build SUMMARY.md (GitBook table of contents) ────────────────────────────
function renderSummary(nodes: LacNode[], project: string): string {
  const lines: string[] = []
  lines.push('# Summary')
  lines.push('')
  lines.push('* [Introduction](README.md)')
  lines.push('')

  // Group by domain, order by priority
  const byDomain = new Map<string, LacNode[]>()
  for (const node of nodes) {
    if (!byDomain.has(node.domain)) byDomain.set(node.domain, [])
    byDomain.get(node.domain)!.push(node)
  }

  // Sort each domain's nodes: no parent first (roots), then children
  for (const [domain, domainNodes] of byDomain) {
    domainNodes.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

    const domainLabel = domain.charAt(0).toUpperCase() + domain.slice(1)
    lines.push(`## ${domainLabel}`)
    lines.push('')

    // Build parent-child tree within domain
    const roots = domainNodes.filter((n) => !n.parent || !nodes.find((p) => p.id === n.parent))
    const childrenOf = (parentId: string) => domainNodes.filter((n) => n.parent === parentId)

    function addNode(node: LacNode, indent: string) {
      lines.push(`${indent}* [${node.title}](${domain}/${node.id}.md)`)
      for (const child of childrenOf(node.id)) {
        addNode(child, indent + '  ')
      }
    }

    for (const root of roots) {
      addNode(root, '')
    }

    lines.push('')
  }

  return lines.join('\n')
}

// ─── landing README ───────────────────────────────────────────────────────────
function renderReadme(nodes: LacNode[], project: string, role: Role): string {
  const lines: string[] = []
  lines.push(`# ${project}`)
  lines.push('')

  const epic = nodes.find((n) => n.type === 'epic')
  if (epic) {
    const problem = epic.views['product']?.['problem'] as string | undefined
    if (problem) {
      lines.push(problem)
      lines.push('')
    }
  }

  const byDomain = new Map<string, LacNode[]>()
  for (const node of nodes) {
    if (!byDomain.has(node.domain)) byDomain.set(node.domain, [])
    byDomain.get(node.domain)!.push(node)
  }

  lines.push('## Contents')
  lines.push('')
  for (const [domain, domainNodes] of byDomain) {
    const label = domain.charAt(0).toUpperCase() + domain.slice(1)
    const active = domainNodes.filter((n) => n.status === 'active' || n.status === 'frozen').length
    lines.push(`**${label}** — ${domainNodes.length} node${domainNodes.length !== 1 ? 's' : ''}${active ? ` (${active} active)` : ''}`)
  }
  lines.push('')

  if (role !== 'all') {
    lines.push(`> 📖 This documentation is filtered for the **${role}** audience.`)
    lines.push('')
  }

  lines.push(`*Generated by [@lifeascode/lac](https://github.com/lifeascode/lac)*`)
  lines.push('')

  return lines.join('\n')
}

// ─── command ──────────────────────────────────────────────────────────────────
export const gitbookCmd = new Command('gitbook')
  .description('Export nodes as a GitBook-compatible Markdown site (SUMMARY.md + one page per node)')
  .argument('[dir]', 'workspace root', '.')
  .option('-o, --out <path>', 'output directory', 'gitbook-out')
  .option(
    '--role <role>',
    'audience filter: user, dev, product, support, tester, all',
    'all'
  )
  .option('--no-build', 'skip running lac build (use existing .lac/graph.json)')
  .action((dir: string, opts: { out: string; role: string; build: boolean }) => {
    const root = resolve(dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }

    const role = opts.role as Role
    const validRoles: Role[] = ['user', 'dev', 'product', 'support', 'tester', 'all']
    if (!validRoles.includes(role)) {
      console.error(`Invalid role "${role}". Use: ${validRoles.join(', ')}`)
      process.exit(1)
    }

    if (opts.build !== false) {
      try {
        buildGraph(root)
      } catch (e) {
        console.error(`Build error: ${(e as Error).message}`)
        process.exit(1)
      }
    }

    const { graph } = buildGraph(root)
    const { nodes, project } = graph

    const outDir = resolve(root, opts.out)
    mkdirSync(outDir, { recursive: true })

    // Collect domains for directory creation
    const domains = [...new Set(nodes.map((n) => n.domain))]
    for (const domain of domains) {
      mkdirSync(join(outDir, domain), { recursive: true })
    }

    // Write node pages
    let count = 0
    for (const node of nodes) {
      const pageContent = renderNodePage(node, nodes, role)
      writeFileSync(join(outDir, node.domain, `${node.id}.md`), pageContent, 'utf8')
      count++
    }

    // Write SUMMARY.md
    writeFileSync(join(outDir, 'SUMMARY.md'), renderSummary(nodes, project), 'utf8')

    // Write README.md (landing page)
    writeFileSync(join(outDir, 'README.md'), renderReadme(nodes, project, role), 'utf8')

    // Write .gitbook.yaml (tells GitBook where the root is)
    writeFileSync(
      join(outDir, '.gitbook.yaml'),
      `root: ./\nstructure:\n  readme: README.md\n  summary: SUMMARY.md\n`,
      'utf8'
    )

    console.log(`✓ GitBook export — ${count} pages → ${outDir}`)
    console.log(`  Role: ${role} · Domains: ${domains.join(', ')}`)
    console.log('')
    console.log('  Next steps:')
    console.log('  1. Commit the output directory to your repo')
    console.log('  2. In GitBook: Integrations → GitHub → point at this directory')
    console.log('  3. Add to CI: lac gitbook --role user -o docs/')
  })
