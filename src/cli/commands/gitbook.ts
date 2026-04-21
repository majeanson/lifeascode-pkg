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

// ─── labels ───────────────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  userGuide:          'How to Play',
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
  escalationPath:     'Need Help?',
  rollback:           'Rollback',
  testCases:          'Test Cases',
  expectedBehavior:   'Expected Behavior',
  steps:              'Steps',
}

// Override label per node type — only include entries that differ from FIELD_LABELS
const FIELD_LABELS_BY_TYPE: Record<string, Partial<Record<string, string>>> = {
  faq:     { userGuide: '' },        // no header for FAQ answers — content flows directly
  runbook: { userGuide: 'Overview' },
}

// Tab title shown to readers for each view
const TAB_LABELS: Record<string, string> = {
  user:    'For Players',
  product: 'Product',
  dev:     'Developer',
  support: 'Guide',
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
  decision: '⚖️',
  epic:     '◈',
  research: '🔬',
  runbook:  '📋',
  faq:      '❓',
  release:  '🏷️',
}

// Custom display order for domains
const DOMAIN_ORDER: Record<string, number> = {
  vision:  0,
  games:   1,
  design:  2,
  core:    3,
  about:   4,
}

const DOMAIN_TITLES: Record<string, string> = {
  vision:  'The Vision',
  games:   'The Games',
  design:  'Design Principles',
  core:    'For Developers',
  about:   'For Parents & Educators',
}

const STATUS_LABEL: Record<string, string> = {
  draft:    'Draft',
  active:   'Active',
  frozen:   'Frozen',
  archived: 'Archived',
}

// Field render order within each view — lower = rendered first
const FIELD_PRIORITY: Record<string, number> = {
  // user view: answer/guide before caveats
  userGuide:          1,
  releaseNotes:       2,
  workarounds:        3,
  knownLimitations:   20,
  // dev view: context → implementation → edge cases
  componentFile:      1,
  implementation:     2,
  codeSnippets:       3,
  edgeCases:          4,
  // product view: narrative → criteria
  problem:            1,
  successCriteria:    2,
  acceptanceCriteria: 3,
  impact:             4,
  metrics:            5,
  // decision view: choice before rationale
  choice:             1,
  rationale:          2,
  // support view: steps → rollback → escalation last
  steps:              1,
  rollback:           2,
  supportNotes:       3,
  escalationPath:     10,
}

// Node types where the meta strip (type · status · tags) adds noise for the audience
const HIDE_META_STRIP = new Set(['faq', 'epic'])

// ─── render a field value to markdown ────────────────────────────────────────
function renderField(key: string, value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    if (key === 'acceptanceCriteria') return value.map((item) => `* [ ] ${String(item)}`).join('\n')
    if (key === 'steps') return value.map((item, i) => `${i + 1}. ${String(item)}`).join('\n')
    return value.map((item) => `* ${String(item)}`).join('\n')
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `**${k}:** ${String(v)}`)
      .join('\n')
  }
  return String(value ?? '')
}

// ─── render one view's fields, ordered and with type-aware labels ─────────────
function renderViewFields(viewId: string, viewData: Record<string, unknown>, nodeType: string): string {
  const lines: string[] = []
  const typeOverrides = FIELD_LABELS_BY_TYPE[nodeType] ?? {}

  // Sort fields by FIELD_PRIORITY, then insertion order
  const sorted = Object.entries(viewData).sort(
    ([a], [b]) => (FIELD_PRIORITY[a] ?? 5) - (FIELD_PRIORITY[b] ?? 5)
  )

  for (const [fieldId, fieldValue] of sorted) {
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') continue
    if (Array.isArray(fieldValue) && fieldValue.length === 0) continue

    // Determine label — empty string means render content with no heading
    const labelOverride = typeOverrides[fieldId]
    const label = labelOverride !== undefined ? labelOverride : (FIELD_LABELS[fieldId] ?? fieldId)
    const rendered = renderField(fieldId, fieldValue)

    if (fieldId === 'knownLimitations') {
      if (label) { lines.push(`### ${label}`); lines.push('') }
      lines.push('{% hint style="warning" %}')
      lines.push(rendered)
      lines.push('{% endhint %}')
    } else if (fieldId === 'successCriteria') {
      if (label) { lines.push(`### ${label}`); lines.push('') }
      lines.push('{% hint style="success" %}')
      lines.push(rendered)
      lines.push('{% endhint %}')
    } else if (fieldId === 'escalationPath') {
      // Rendered inline at the bottom of the support view — no section header
      lines.push('---')
      lines.push('')
      lines.push('{% hint style="info" %}')
      lines.push(`**Need help?** ${rendered}`)
      lines.push('{% endhint %}')
    } else if (fieldId === 'componentFile') {
      if (label) { lines.push(`### ${label}`); lines.push('') }
      lines.push(`\`${rendered}\``)
    } else {
      if (label) { lines.push(`### ${label}`); lines.push('') }
      lines.push(rendered)
    }

    lines.push('')
  }

  return lines.join('\n')
}

// ─── render node views as GitBook tabs (or flat for single-view nodes) ────────
function renderViews(node: LacNode, viewsToShow: string[]): string {
  const populated: Array<{ id: string; content: string }> = []

  for (const viewId of viewsToShow) {
    const viewData = node.views[viewId]
    if (!viewData || Object.keys(viewData).length === 0) continue

    const content = renderViewFields(viewId, viewData as Record<string, unknown>, node.type)
    if (content.trim()) populated.push({ id: viewId, content })
  }

  if (populated.length === 0) return '*No content yet for the selected audience.*\n'

  // Single view — no tabs wrapper
  if (populated.length === 1) return populated[0]!.content

  // Multiple views — GitBook tabs
  const lines: string[] = []
  lines.push('{% tabs %}')
  for (const { id, content } of populated) {
    const title = TAB_LABELS[id] ?? id
    lines.push(`{% tab title="${title}" %}`)
    lines.push(content.trim())
    lines.push('{% endtab %}')
  }
  lines.push('{% endtabs %}')
  lines.push('')
  return lines.join('\n')
}

// ─── render a single node page ────────────────────────────────────────────────
function renderNodePage(node: LacNode, allNodes: LacNode[], role: Role): string {
  const lines: string[] = []
  const viewsToShow = ROLE_VIEWS[role]

  // GitBook frontmatter description (shows as subtitle in sidebar nav)
  const tagline =
    (node.views['product']?.['problem'] as string | undefined)?.split('\n')[0]
    ?? (node.views['user']?.['userGuide'] as string | undefined)?.split('\n')[0]
    ?? ''
  if (tagline) {
    lines.push('---')
    lines.push(`description: >-`)
    lines.push(`  ${tagline.replace(/"/g, "'")}`)
    lines.push('---')
    lines.push('')
  }

  // Page title
  const icon = TYPE_ICONS[node.type] ?? '◦'
  lines.push(`# ${icon} ${node.title}`)
  lines.push('')

  // Meta strip — omitted for FAQ and Epic (parent/educator-facing; type/status adds noise)
  if (!HIDE_META_STRIP.has(node.type)) {
    const statusLabel = STATUS_LABEL[node.status] ?? node.status
    const typeLabel = TYPE_LABELS[node.type] ?? node.type
    const tagBadges = (node.tags ?? []).map((t) => `\`${t}\``).join(' ')
    lines.push(`> **${typeLabel}** · ${statusLabel}${tagBadges ? ' · ' + tagBadges : ''}`)
    lines.push('')
  }

  // Permanent-decision danger callout
  if (node.type === 'decision') {
    const rationale = node.views['dev']?.['rationale'] as string | undefined
    const isPermanent = rationale?.toLowerCase().includes('permanent') || rationale?.toLowerCase().includes('non-negotiable')
    if (isPermanent) {
      lines.push('{% hint style="danger" %}')
      lines.push('This is a permanent design decision. It is not open for reconsideration unless a formal decision node is created to override it.')
      lines.push('{% endhint %}')
      lines.push('')
    }
  }

  // Screenshot / mockup for game feature pages
  if (node.type === 'feature' && node.domain === 'games' && node.id !== 'feature-game-mechanics-shared-gx00') {
    lines.push(`![](<../.gitbook/assets/${node.id}.png>)`)
    lines.push('')
  }

  // Main content
  lines.push(renderViews(node, viewsToShow))

  // ── Relationships ───────────────────────────────────────────────────────────
  const relLines: string[] = []

  if (node.parent) {
    const parentNode = allNodes.find((n) => n.id === node.parent)
    const parentTitle = parentNode?.title ?? node.parent
    const parentIcon = parentNode ? (TYPE_ICONS[parentNode.type] ?? '◦') : '◦'
    relLines.push(`**Part of:** [${parentIcon} ${parentTitle}](../${parentNode?.domain ?? node.domain}/${node.parent}.md)`)
  }

  const children = allNodes.filter((n) => n.parent === node.id || node.children?.includes(n.id))
  if (children.length > 0) {
    relLines.push(`**Includes:**`)
    for (const c of children) {
      const cIcon = TYPE_ICONS[c.type] ?? '◦'
      relLines.push(`* [${cIcon} ${c.title}](../${c.domain}/${c.id}.md)`)
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
    // Use context-aware labels per node type
    const refLabel = node.type === 'decision' ? 'Applies to' : node.type === 'runbook' ? 'Architecture' : 'See also'
    relLines.push(`**${refLabel}:** ${node.references.map((id) => {
      const n = allNodes.find((x) => x.id === id)
      const refIcon = n ? (TYPE_ICONS[n.type] ?? '◦') : '◦'
      return `[${refIcon} ${n?.title ?? id}](../${n?.domain ?? 'nodes'}/${id}.md)`
    }).join(' · ')}`)
  }

  if (relLines.length > 0) {
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('## Relationships')
    lines.push('')
    lines.push(...relLines)
    lines.push('')
  }

  return lines.join('\n')
}

// ─── SUMMARY.md ───────────────────────────────────────────────────────────────
function renderSummary(nodes: LacNode[]): string {
  const lines: string[] = []
  lines.push('# Summary')
  lines.push('')
  lines.push('* [Introduction](README.md)')
  lines.push('')

  const byDomain = new Map<string, LacNode[]>()
  for (const node of nodes) {
    if (!byDomain.has(node.domain)) byDomain.set(node.domain, [])
    byDomain.get(node.domain)!.push(node)
  }

  const sortedDomains = [...byDomain.keys()].sort(
    (a, b) => (DOMAIN_ORDER[a] ?? 99) - (DOMAIN_ORDER[b] ?? 99)
  )

  for (const domain of sortedDomains) {
    const domainNodes = byDomain.get(domain)!
    domainNodes.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

    const domainTitle = DOMAIN_TITLES[domain] ?? (domain.charAt(0).toUpperCase() + domain.slice(1))
    lines.push(`## ${domainTitle}`)
    lines.push('')

    const roots = domainNodes.filter((n) => !n.parent || !nodes.find((p) => p.id === n.parent))
    const childrenOf = (id: string) => domainNodes.filter((n) => n.parent === id)

    function addNode(node: LacNode, indent: string) {
      const nodeIcon = TYPE_ICONS[node.type] ?? '◦'
      lines.push(`${indent}* [${nodeIcon} ${node.title}](${domain}/${node.id}.md)`)
      for (const child of childrenOf(node.id)) addNode(child, indent + '  ')
    }

    for (const root of roots) addNode(root, '')
    lines.push('')
  }

  return lines.join('\n')
}

// ─── README landing page ──────────────────────────────────────────────────────
function renderReadme(nodes: LacNode[], project: string, role: Role): string {
  const lines: string[] = []

  lines.push(`# ${project}`)
  lines.push('')
  lines.push('{% hint style="info" %}')
  lines.push('An open-source collection of calm, screen-safe educational games for children aged 3–7.')
  lines.push('No ads · No sounds · No timers · No game over')
  lines.push('{% endhint %}')
  lines.push('')

  const epic = nodes.find((n) => n.type === 'epic')
  if (epic) {
    const problem = epic.views['product']?.['problem'] as string | undefined
    if (problem) { lines.push(problem); lines.push('') }
  }

  // Games table
  const games = nodes
    .filter((n) => n.type === 'feature' && n.domain === 'games' && n.id !== 'feature-game-mechanics-shared-gx00')
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

  if (games.length > 0) {
    lines.push('## The Games')
    lines.push('')
    lines.push('| | Game | Ages | What it teaches |')
    lines.push('|--|------|------|-----------------|')
    const GAME_EMOJI: Record<string, string> = {
      'feature-count-the-dots-g1a2':  '🔵',
      'feature-letter-match-g2b3':    '🔤',
      'feature-shape-spotter-g3c4':   '🔷',
      'feature-color-corner-g4d5':    '🎨',
      'feature-what-comes-next-g5e6': '❓',
    }
    for (const game of games) {
      const emoji = GAME_EMOJI[game.id] ?? '⬡'
      const ageTag = (game.tags ?? []).find((t) => t.startsWith('ages-'))
      const ageRange = ageTag ? ageTag.replace('ages-', '').replace('-', '–') : '3–7'
      const problem = (game.views['product']?.['problem'] as string | undefined)?.split('\n')[0] ?? ''
      const statusNote = game.status === 'draft' ? ' _(coming soon)_' : ''
      lines.push(`| ${emoji} | [**${game.title}**](games/${game.id}.md)${statusNote} | ${ageRange} | ${problem} |`)
    }
    lines.push('')
  }

  // Design principles
  const decisions = nodes
    .filter((n) => n.type === 'decision')
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

  if (decisions.length > 0) {
    lines.push('## Design Principles')
    lines.push('')
    lines.push('Every Quiet Minds game is built on three non-negotiable commitments:')
    lines.push('')
    for (const d of decisions) {
      lines.push(`* **[${d.title}](design/${d.id}.md)**`)
    }
    lines.push('')
  }

  // For parents
  const faqs = nodes.filter((n) => n.type === 'faq').sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
  if (faqs.length > 0) {
    lines.push('## For Parents & Educators')
    lines.push('')
    for (const faq of faqs) {
      const answer = (faq.views['user']?.['userGuide'] as string | undefined)?.split('\n')[0] ?? ''
      lines.push(`* **[${faq.title}](about/${faq.id}.md)** — ${answer}`)
    }
    lines.push('')
  }

  if (role !== 'all') {
    lines.push('{% hint style="info" %}')
    lines.push(`This documentation is filtered for the **${role}** audience.`)
    lines.push('{% endhint %}')
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('*Documented with [Life as Code](https://github.com/lifeascode/lac) · Built with care for young learners*')
  lines.push('')

  return lines.join('\n')
}

// ─── command ──────────────────────────────────────────────────────────────────
export const gitbookCmd = new Command('gitbook')
  .description('Export nodes as a GitBook-compatible Markdown site (SUMMARY.md + one page per node)')
  .argument('[dir]', 'workspace root', '.')
  .option('-o, --out <path>', 'output directory', 'gitbook-out')
  .option('--role <role>', 'audience filter: user, dev, product, support, tester, all', 'all')
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
      try { buildGraph(root) } catch (e) {
        console.error(`Build error: ${(e as Error).message}`)
        process.exit(1)
      }
    }

    const { graph } = buildGraph(root)
    const { nodes, project } = graph

    const outDir = resolve(root, opts.out)
    mkdirSync(outDir, { recursive: true })
    mkdirSync(join(outDir, '.gitbook', 'assets'), { recursive: true })

    const domains = [...new Set(nodes.map((n) => n.domain))]
    for (const domain of domains) mkdirSync(join(outDir, domain), { recursive: true })

    let count = 0
    for (const node of nodes) {
      writeFileSync(join(outDir, node.domain, `${node.id}.md`), renderNodePage(node, nodes, role), 'utf8')
      count++
    }

    writeFileSync(join(outDir, 'SUMMARY.md'), renderSummary(nodes), 'utf8')
    writeFileSync(join(outDir, 'README.md'), renderReadme(nodes, project, role), 'utf8')
    writeFileSync(join(outDir, '.gitbook.yaml'), `root: ./\nstructure:\n  readme: README.md\n  summary: SUMMARY.md\n`, 'utf8')

    console.log(`✓ GitBook export — ${count} pages → ${outDir}`)
    console.log(`  Role: ${role} · Domains: ${domains.join(', ')}`)
    console.log('')
    console.log('  Next steps:')
    console.log('  1. Add screenshots to docs/.gitbook/assets/{node-id}.png')
    console.log('  2. Commit docs/ to trigger GitBook sync')
    console.log('  3. In GitBook: Integrations → GitHub → root directory: playground/docs')
  })
