import React, { useState } from 'react'
import {
  LacHub,
  LacDataProvider,
  LacSprintBoard,
  LacDecisionLog,
  LacSearch,
  LacGuide,
  LacSuccessBoard,
  LacHelpPanel,
  LacFeatureCard,
  useLacData,
  DARK_THEME,
} from '@lifeascode'

const DATA_URL = '/graph.json'
const T = DARK_THEME

// ─── colour tokens ────────────────────────────────────────────────────────────
const BG = '#0d1117'
const SURFACE = '#161b22'
const BORDER = '#30363d'
const TEXT = '#e6edf3'
const MUTED = '#8b949e'
const ACCENT = '#58a6ff'
const ACCENT_DIM = 'rgba(88,166,255,0.12)'

// ─── top-level tabs ───────────────────────────────────────────────────────────
type Tab = 'hub' | 'sprint' | 'search' | 'decisions' | 'guide' | 'success' | 'card' | 'help' | 'cli' | 'mcp'

const NAV: Array<{ id: Tab; label: string; badge?: string }> = [
  { id: 'hub',       label: 'Hub',        badge: 'all-in-one' },
  { id: 'sprint',    label: 'Sprint' },
  { id: 'search',    label: 'Search' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'guide',     label: 'Guide' },
  { id: 'success',   label: 'Success' },
  { id: 'card',      label: 'Card' },
  { id: 'help',      label: 'Help Panel' },
  { id: 'cli',       label: 'CLI' },
  { id: 'mcp',       label: 'MCP' },
]

// ─── shell helpers ────────────────────────────────────────────────────────────
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ background: 'rgba(110,118,129,0.15)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'inherit', fontSize: '13px', color: ACCENT }}>
      {children}
    </code>
  )
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: TEXT }}>{title}</div>
        {sub && <div style={{ fontSize: '13px', color: MUTED, marginTop: '4px' }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

function ImportBox({ code }: { code: string }) {
  return (
    <pre style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px 16px', fontSize: '12px', color: '#c9d1d9', overflowX: 'auto', marginBottom: '20px', lineHeight: '1.7' }}>
      {code}
    </pre>
  )
}

// ─── node stats banner (uses context) ────────────────────────────────────────
function StatsBanner() {
  const { nodes } = useLacData()
  const byStatus = (s: string) => nodes.filter((n) => n.status === s).length
  const byType = (t: string) => nodes.filter((n) => n.type === t).length
  const stats = [
    { label: 'Total nodes', value: nodes.length },
    { label: 'Active', value: byStatus('active') },
    { label: 'Frozen', value: byStatus('frozen') },
    { label: 'Draft', value: byStatus('draft') },
    { label: 'Features', value: byType('feature') },
    { label: 'Decisions', value: byType('decision') },
    { label: 'FAQs', value: byType('faq') + byType('runbook') },
  ]
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '12px 24px', borderBottom: `1px solid ${BORDER}`, flexWrap: 'wrap', background: SURFACE }}>
      {stats.map((s) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: ACCENT }}>{s.value}</span>
          <span style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── CLI reference ────────────────────────────────────────────────────────────
const CLI_COMMANDS = [
  { cmd: 'lac init [dir]',             desc: 'Scaffold lac.config.json in a project directory' },
  { cmd: 'lac create <type> <title>',  desc: 'Create nodes/<domain>/<id>/node.md with frontmatter scaffolding' },
  { cmd: 'lac build [dir]',            desc: 'Validate all nodes and emit .lac/graph.json + .lac/index.json' },
  { cmd: 'lac lint [dir]',             desc: 'Report schema errors, lifecycle violations, frozen-completeness gaps' },
  { cmd: 'lac advance <id> <status>',  desc: 'Validate transition requirements and advance node status' },
  { cmd: 'lac fill <id>',              desc: 'AI-fill empty required fields using Claude (needs ANTHROPIC_API_KEY)' },
  { cmd: 'lac status [dir]',           desc: 'Health summary — counts by status, blocked nodes, completeness %' },
  { cmd: 'lac search <query>',         desc: 'Full-text search across all nodes — outputs matching titles + IDs' },
]

function CLISection() {
  return (
    <Section title="CLI Reference" sub="Install: npm install -g @lifeascode  →  lac --help">
      <ImportBox code={`# Install globally\nnpm install -g @lifeascode\n\n# Or use npx\nnpx @lifeascode create feature "My Feature"`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {CLI_COMMANDS.map(({ cmd, desc }) => (
          <div key={cmd} style={{ display: 'flex', gap: '16px', padding: '12px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', alignItems: 'flex-start' }}>
            <Code>{cmd}</Code>
            <span style={{ color: MUTED, fontSize: '13px', lineHeight: '1.6', paddingTop: '2px' }}>{desc}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', padding: '14px 16px', background: ACCENT_DIM, borderRadius: '8px', border: `1px solid ${ACCENT}33` }}>
        <div style={{ fontSize: '12px', color: MUTED, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lifecycle</div>
        <div style={{ fontSize: '13px', color: TEXT, lineHeight: '1.8' }}>
          <Code>draft</Code> → <Code>active</Code> (requires: analysis, implementation, 1+ decision) → <Code>frozen</Code> (requires: all fields + userGuide + componentFile) → <Code>deprecated</Code>
        </div>
      </div>
    </Section>
  )
}

// ─── MCP reference ────────────────────────────────────────────────────────────
const MCP_TOOLS = [
  { name: 'get_node_status',        desc: 'Full status summary for a node — fields, gaps, next action' },
  { name: 'summarize_workspace',    desc: 'Counts by type and status, blocked nodes, overall health' },
  { name: 'roadmap_view',           desc: 'Prioritized view of all nodes — epics, features, bugs, decisions' },
  { name: 'create_node',            desc: 'Create a new node.md with scaffolded frontmatter' },
  { name: 'read_node_context',      desc: 'Read full node content including all view fields and relationships' },
  { name: 'write_node_fields',      desc: 'Write fields using dot-path notation (e.g. views.dev.implementation)' },
  { name: 'advance_node',           desc: 'Validate and transition node status with optional reason' },
  { name: 'fill_node',              desc: 'AI-fill empty required fields using Claude' },
  { name: 'build_graph',            desc: 'Run lac build and return the updated graph summary' },
  { name: 'search_nodes',           desc: 'Full-text search — returns matching node IDs, titles, statuses' },
  { name: 'get_lineage',            desc: 'Trace parent → children → references chain for a node' },
  { name: 'audit_decisions',        desc: 'Surface tech debt — frozen decisions with no rationale' },
  { name: 'blame_file',             desc: 'Find nodes referencing a source file via componentFile' },
  { name: 'cross_node_impact',      desc: 'Blast radius — which nodes reference a given file or node' },
  { name: 'node_similarity',        desc: 'Find nodes with overlapping title/tags — detect duplicates' },
  { name: 'suggest_split',          desc: 'Suggest how to split an oversized node into focused children' },
  { name: 'node_changelog',         desc: 'Full statusHistory + annotations timeline for a node' },
  { name: 'spawn_child_node',       desc: 'Create a child node pre-linked to a parent' },
  { name: 'lock_node_fields',       desc: 'Lock specific fields to prevent overwrite' },
  { name: 'node_summary_for_pr',    desc: 'Generate a PR description snippet from a frozen node' },
]

function MCPSection() {
  return (
    <Section title="MCP Server — 20 Tools" sub="Wire lac-mcp into Claude Code or Claude Desktop via .mcp.json">
      <ImportBox code={`# .mcp.json\n{\n  "mcpServers": {\n    "lac": {\n      "command": "lac-mcp",\n      "cwd": "/path/to/your/project"\n    }\n  }\n}`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '8px' }}>
        {MCP_TOOLS.map(({ name, desc }) => (
          <div key={name} style={{ padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: ACCENT, fontFamily: 'inherit', marginBottom: '4px' }}>{name}</div>
            <div style={{ fontSize: '12px', color: MUTED, lineHeight: '1.5' }}>{desc}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── card demo (picks a specific node from context) ──────────────────────────
function CardSection() {
  const { nodes } = useLacData()
  const nodeIndex = new Map(nodes.map((n) => [n.id, n]))
  const node = nodes.find((n) => n.id === 'feature-react-hub') ?? nodes[0]
  if (!node) return <div style={{ padding: '24px', color: MUTED }}>No nodes loaded.</div>
  return (
    <Section title="LacFeatureCard" sub="Full node detail — view tabs, markdown rendering, relationships, inline edit">
      <ImportBox code={`import { LacFeatureCard } from '@lifeascode'\n\n<LacFeatureCard\n  node={node}\n  theme={theme}\n  defaultView="dev"\n  nodeIndex={nodeIndex}\n  onSave={async (id, domain, fields) => { /* persist */ }}\n/>`} />
      <LacFeatureCard node={node} theme={T} defaultView="dev" nodeIndex={nodeIndex} style={{ maxWidth: '820px' }} />
    </Section>
  )
}

// ─── help panel demo ──────────────────────────────────────────────────────────
function HelpSection() {
  const [query, setQuery] = useState('markdown')
  return (
    <Section title="LacHelpPanel" sub="Floating or inline node lookup — wire to a help button in your app">
      <ImportBox code={`import { LacHelpPanel } from '@lifeascode'\n\n// By node ID\n<LacHelpPanel nodeId="faq-migrate-from-old-lac" position="inline" />\n\n// By search query\n<LacHelpPanel query="markdown format" position="right" />`} />
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', color: MUTED, marginRight: '10px' }}>Search query:</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '6px 10px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', color: TEXT, fontFamily: 'inherit', fontSize: '13px', outline: 'none', width: '260px' }}
        />
      </div>
      <LacHelpPanel query={query} position="inline" style={{ maxWidth: '680px' }} />
    </Section>
  )
}

// ─── tab content dispatcher ───────────────────────────────────────────────────
function TabContent({ tab }: { tab: Tab }) {
  if (tab === 'sprint') return (
    <Section title="LacSprintBoard" sub="Active and draft nodes sorted by priority — your living backlog">
      <ImportBox code={`import { LacDataProvider, LacSprintBoard } from '@lifeascode'\n\n<LacDataProvider dataUrl="/.lac/graph.json">\n  <LacSprintBoard domains={['core', 'mcp']} />\n</LacDataProvider>`} />
      <LacSprintBoard />
    </Section>
  )
  if (tab === 'search') return (
    <Section title="LacSearch" sub="Real-time full-text search across all nodes — title, tags, domain">
      <ImportBox code={`import { LacSearch } from '@lifeascode'\n\n<LacSearch placeholder="Search nodes…" autoFocus />`} />
      <LacSearch autoFocus placeholder="Search nodes… (try: decision, markdown, AI)" />
    </Section>
  )
  if (tab === 'decisions') return (
    <Section title="LacDecisionLog" sub="All decision nodes — architectural choices with rationale">
      <ImportBox code={`import { LacDecisionLog } from '@lifeascode'\n\n<LacDecisionLog />`} />
      <LacDecisionLog />
    </Section>
  )
  if (tab === 'guide') return (
    <Section title="LacGuide" sub="FAQ, runbook, and frozen feature browser — for users and support">
      <ImportBox code={`import { LacGuide } from '@lifeascode'\n\n<LacGuide />`} />
      <LacGuide />
    </Section>
  )
  if (tab === 'success') return (
    <Section title="LacSuccessBoard" sub="Nodes with success criteria — verify what done means for each feature">
      <ImportBox code={`import { LacSuccessBoard } from '@lifeascode'\n\n<LacSuccessBoard />`} />
      <LacSuccessBoard />
    </Section>
  )
  if (tab === 'card') return <CardSection />
  if (tab === 'help') return <HelpSection />
  return null
}

// ─── root app ─────────────────────────────────────────────────────────────────
export function App() {
  const [tab, setTab] = useState<Tab>('hub')

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '18px', fontWeight: 800, color: ACCENT, letterSpacing: '-0.02em' }}>@lifeascode</span>
        <span style={{ color: BORDER, fontSize: '14px' }}>|</span>
        <span style={{ fontSize: '13px', color: MUTED }}>Structured knowledge graph for features, decisions, and docs</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <code style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: TEXT }}>
            npm install @lifeascode
          </code>
          <a href="https://www.npmjs.com/package/@lifeascode" target="_blank" rel="noreferrer"
            style={{ fontSize: '11px', color: ACCENT, textDecoration: 'none', border: `1px solid ${ACCENT}44`, borderRadius: '6px', padding: '4px 10px' }}>
            npm
          </a>
        </div>
      </div>

      {/* This playground is self-documented — the fixture data is @lifeascode documenting itself */}
      <div style={{ padding: '10px 24px', borderBottom: `1px solid ${BORDER}`, background: 'rgba(88,166,255,0.04)', fontSize: '12px', color: MUTED }}>
        The nodes below are <strong style={{ color: TEXT }}>@lifeascode documenting itself</strong> — its own features, decisions, and guides stored as LAC nodes. This playground is the graph.
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, background: SURFACE, overflowX: 'auto' }}>
        {NAV.map(({ id, label, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === id ? `2px solid ${ACCENT}` : '2px solid transparent',
              color: tab === id ? ACCENT : MUTED,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '13px',
              fontWeight: tab === id ? 600 : 400,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {label}
            {badge && <span style={{ fontSize: '9px', background: ACCENT_DIM, color: ACCENT, borderRadius: '4px', padding: '1px 5px', letterSpacing: '0.04em' }}>{badge}</span>}
          </button>
        ))}
      </div>

      {/* Hub tab — LacHub has its own provider */}
      {tab === 'hub' && (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: TEXT }}>LacHub</div>
            <div style={{ fontSize: '13px', color: MUTED, marginTop: '4px' }}>The all-in-one embeddable dashboard — drop one component into your app</div>
          </div>
          <ImportBox code={`import { LacHub } from '@lifeascode'\n\n<LacHub\n  dataUrl="/.lac/graph.json"\n  theme="dark"\n  themeOverrides={{ accent: '#58a6ff' }}\n  defaultTab="sprint"\n/>`} />
          <LacHub dataUrl={DATA_URL} theme="dark" style={{ border: `1px solid ${BORDER}`, borderRadius: '10px' }} />
        </div>
      )}

      {/* CLI + MCP tabs — no data context needed */}
      {tab === 'cli' && <CLISection />}
      {tab === 'mcp' && <MCPSection />}

      {/* All component tabs — wrapped in shared LacDataProvider */}
      {tab !== 'hub' && tab !== 'cli' && tab !== 'mcp' && (
        <LacDataProvider dataUrl={DATA_URL} theme="dark">
          <StatsBanner />
          <TabContent tab={tab} />
        </LacDataProvider>
      )}

    </div>
  )
}
