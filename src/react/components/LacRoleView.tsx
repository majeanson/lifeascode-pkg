import React, { useState } from 'react'
import type { LacNode } from '../../schema.js'
import { useLacData } from '../hooks.js'
import { getViewField, typeLabel } from '../utils.js'
import { LacNodeField } from './LacNodeField.js'

// ─── audience roles ───────────────────────────────────────────────────────────
export type AudienceRole = 'user' | 'dev' | 'support' | 'product' | 'tester'

interface FieldSpec {
  path: string
  label?: string
  isList?: boolean
  as?: 'prose' | 'list' | 'code' | 'badge'
}

interface SectionSpec {
  /** node types to include in this section */
  nodeTypes: string[]
  /** heading shown above this group */
  sectionTitle: string
  /** which statuses to include (defaults to all non-deprecated) */
  statuses?: string[]
  /** fields to render per node, in order */
  fields: FieldSpec[]
}

// ─── role → content mapping (the heart of the component) ─────────────────────
// Each role sees different node types through different field lenses.
// This config is what makes the component project-agnostic.
const ROLE_SECTIONS: Record<AudienceRole, SectionSpec[]> = {
  user: [
    {
      nodeTypes: ['faq'],
      sectionTitle: 'Frequently Asked Questions',
      fields: [
        { path: 'views.user.userGuide', label: '' },
        { path: 'views.user.knownLimitations', label: 'Keep in mind', isList: true },
      ],
    },
    {
      nodeTypes: ['feature', 'release'],
      sectionTitle: 'How to use',
      statuses: ['frozen', 'active'],
      fields: [
        { path: 'views.user.userGuide', label: '' },
        { path: 'views.user.knownLimitations', label: 'Limitations', isList: true },
        { path: 'views.user.releaseNotes', label: 'Release notes' },
      ],
    },
  ],

  dev: [
    {
      nodeTypes: ['decision'],
      sectionTitle: 'Architecture Decisions',
      fields: [
        { path: 'views.dev.choice', label: 'Decision' },
        { path: 'views.dev.rationale', label: 'Rationale' },
        { path: 'views.dev.edgeCases', label: 'Edge cases' },
      ],
    },
    {
      nodeTypes: ['feature'],
      sectionTitle: 'Features',
      fields: [
        { path: 'views.dev.componentFile', label: 'Component', as: 'code' },
        { path: 'views.dev.implementation', label: 'Implementation' },
        { path: 'views.dev.edgeCases', label: 'Edge cases' },
      ],
    },
    {
      nodeTypes: ['runbook'],
      sectionTitle: 'Runbooks',
      fields: [
        { path: 'views.support.steps', label: 'Steps', isList: true, as: 'list' },
        { path: 'views.support.rollback', label: 'Rollback' },
        { path: 'views.support.escalationPath', label: 'Escalation', as: 'code' },
      ],
    },
    {
      nodeTypes: ['research'],
      sectionTitle: 'Research',
      fields: [
        { path: 'views.dev.implementation', label: 'Findings' },
        { path: 'views.dev.rationale', label: 'Rationale' },
      ],
    },
  ],

  support: [
    {
      nodeTypes: ['runbook'],
      sectionTitle: 'Runbooks',
      fields: [
        { path: 'views.support.steps', label: 'Steps', isList: true, as: 'list' },
        { path: 'views.support.escalationPath', label: 'Escalation' },
        { path: 'views.support.rollback', label: 'Rollback' },
      ],
    },
    {
      nodeTypes: ['faq'],
      sectionTitle: 'FAQ',
      fields: [
        { path: 'views.user.userGuide', label: '' },
        { path: 'views.user.knownLimitations', label: 'Known issues', isList: true },
      ],
    },
    {
      nodeTypes: ['bug'],
      sectionTitle: 'Known Bugs',
      statuses: ['active'],
      fields: [
        { path: 'views.product.problem', label: 'Description' },
        { path: 'views.dev.edgeCases', label: 'Reproduction steps' },
      ],
    },
  ],

  product: [
    {
      nodeTypes: ['epic'],
      sectionTitle: 'Vision',
      fields: [
        { path: 'views.product.problem', label: 'The problem we solve' },
        { path: 'views.product.successCriteria', label: 'Success looks like' },
      ],
    },
    {
      nodeTypes: ['feature'],
      sectionTitle: 'Features',
      fields: [
        { path: 'views.product.problem', label: 'Problem' },
        { path: 'views.product.acceptanceCriteria', label: 'Acceptance criteria', isList: true, as: 'list' },
        { path: 'views.product.impact', label: 'Impact' },
      ],
    },
    {
      nodeTypes: ['decision'],
      sectionTitle: 'Key Decisions',
      fields: [
        { path: 'views.dev.choice', label: 'Decision' },
        { path: 'views.product.impact', label: 'Impact' },
      ],
    },
  ],

  tester: [
    {
      nodeTypes: ['feature'],
      sectionTitle: 'Features to Test',
      fields: [
        { path: 'views.tester.testCases', label: 'Test cases', isList: true, as: 'list' },
        { path: 'views.tester.edgeCases', label: 'Edge cases', isList: true, as: 'list' },
        { path: 'views.tester.expectedBehavior', label: 'Expected behavior' },
      ],
    },
    {
      nodeTypes: ['bug'],
      sectionTitle: 'Bug Reports',
      statuses: ['active'],
      fields: [
        { path: 'views.product.problem', label: 'Description' },
        { path: 'views.tester.testCases', label: 'Steps to reproduce', isList: true, as: 'list' },
        { path: 'views.tester.expectedBehavior', label: 'Expected behavior' },
      ],
    },
  ],
}

// ─── role meta (labels, descriptions for switcher UI) ────────────────────────
export const ROLE_META: Record<AudienceRole, { label: string; description: string; emoji: string }> = {
  user:    { label: 'User Guide',    description: 'How to use this — for everyone', emoji: '👤' },
  dev:     { label: 'Developer',     description: 'Implementation, decisions, architecture', emoji: '⚙️' },
  support: { label: 'Support',       description: 'Runbooks, escalation paths, known issues', emoji: '🛟' },
  product: { label: 'Product',       description: 'Features, acceptance criteria, vision', emoji: '📋' },
  tester:  { label: 'Tester',        description: 'Test cases, edge cases, expected behavior', emoji: '🧪' },
}

// ─── props ────────────────────────────────────────────────────────────────────
export interface LacRoleViewProps {
  role: AudienceRole
  /** Filter nodes to specific domains */
  domain?: string | string[]
  /** Override which node types to show (overrides role default) */
  nodeTypes?: string[]
  /** Show a role picker above the content */
  showRolePicker?: boolean
  onRoleChange?: (role: AudienceRole) => void
  /** Layout variant */
  layout?: 'accordion' | 'cards' | 'flat'
  /** Empty state message */
  emptyMessage?: string
  style?: React.CSSProperties
  /** Colors — defaults to a clean light theme so it works in any app */
  colors?: {
    bg?: string
    surface?: string
    border?: string
    text?: string
    muted?: string
    accent?: string
    sectionHeading?: string
  }
}

// ─── defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_COLORS = {
  bg: 'transparent',
  surface: '#ffffff',
  border: '#e0dbd3',
  text: '#1a1a2e',
  muted: '#6b6570',
  accent: '#7ec8a4',
  sectionHeading: '#1a1a2e',
}

// ─── single node accordion item ───────────────────────────────────────────────
function NodeItem({
  node,
  fields,
  layout,
  colors: c,
}: {
  node: LacNode
  fields: FieldSpec[]
  layout: 'accordion' | 'cards' | 'flat'
  colors: typeof DEFAULT_COLORS
}) {
  const [open, setOpen] = useState(layout === 'flat')

  // Check if any field has content
  const hasContent = fields.some((f) => {
    const val = getViewField(node, f.path)
    return val != null && val !== '' && !(Array.isArray(val) && val.length === 0)
  })
  if (!hasContent) return null

  if (layout === 'flat') {
    return (
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: c.text, marginBottom: '12px' }}>
          {node.title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fields.map((f) => (
            <LacNodeField
              key={f.path}
              node={node}
              field={f.path}
              label={f.label}
              as={f.as ?? (f.isList ? 'list' : undefined)}
              textColor={c.text}
              mutedColor={c.muted}
              accentColor={c.accent}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ border: `1px solid ${c.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: open ? `${c.accent}10` : c.surface,
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 600, color: c.text }}>{node.title}</span>
        <span style={{ fontSize: '18px', color: c.muted, lineHeight: 1 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '16px', background: c.surface, display: 'flex', flexDirection: 'column', gap: '14px', borderTop: `1px solid ${c.border}` }}>
          {fields.map((f) => (
            <LacNodeField
              key={f.path}
              node={node}
              field={f.path}
              label={f.label}
              as={f.as ?? (f.isList ? 'list' : undefined)}
              textColor={c.text}
              mutedColor={c.muted}
              accentColor={c.accent}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export function LacRoleView({
  role,
  domain,
  nodeTypes: nodeTypesOverride,
  showRolePicker = false,
  onRoleChange,
  layout = 'accordion',
  emptyMessage,
  style,
  colors,
}: LacRoleViewProps) {
  const { nodes } = useLacData()
  const [activeRole, setActiveRole] = useState<AudienceRole>(role)

  const c = { ...DEFAULT_COLORS, ...colors }
  const sections = ROLE_SECTIONS[activeRole]

  const handleRoleChange = (r: AudienceRole) => {
    setActiveRole(r)
    onRoleChange?.(r)
  }

  // Filter nodes for a section
  const getNodes = (spec: SectionSpec): LacNode[] => {
    const types = nodeTypesOverride ?? spec.nodeTypes
    const statuses = spec.statuses ?? ['draft', 'active', 'frozen']
    const domainFilter = Array.isArray(domain) ? domain : domain ? [domain] : null

    return nodes.filter((n) =>
      types.includes(n.type) &&
      statuses.includes(n.status) &&
      (domainFilter ? domainFilter.includes(n.domain) : true)
    ).sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.title.localeCompare(b.title))
  }

  const hasAnyContent = sections.some((s) =>
    getNodes(s).some((n) =>
      s.fields.some((f) => {
        const val = getViewField(n, f.path)
        return val != null && val !== '' && !(Array.isArray(val) && val.length === 0)
      })
    )
  )

  return (
    <div style={{ background: c.bg, ...style }}>
      {/* Role picker */}
      {showRolePicker && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {(Object.keys(ROLE_META) as AudienceRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', border: `1px solid ${activeRole === r ? c.accent : c.border}`,
                background: activeRole === r ? `${c.accent}18` : c.surface,
                color: activeRole === r ? c.accent : c.muted,
              }}
            >
              {ROLE_META[r].emoji} {ROLE_META[r].label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {!hasAnyContent ? (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: c.muted, fontSize: '14px' }}>
          {emptyMessage ?? `No ${ROLE_META[activeRole].label.toLowerCase()} content yet.\nAdd nodes with ${activeRole} view fields to see them here.`}
        </div>
      ) : (
        sections.map((spec) => {
          const sectionNodes = getNodes(spec)
          if (sectionNodes.length === 0) return null
          return (
            <div key={spec.sectionTitle} style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: c.muted, margin: '0 0 14px' }}>
                {spec.sectionTitle}
              </h3>
              {sectionNodes.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  fields={spec.fields}
                  layout={layout}
                  colors={c}
                />
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── role switcher standalone component ───────────────────────────────────────
export interface LacRoleSwitcherProps {
  value: AudienceRole
  onChange: (role: AudienceRole) => void
  style?: React.CSSProperties
  colors?: LacRoleViewProps['colors']
}

export function LacRoleSwitcher({ value, onChange, style, colors }: LacRoleSwitcherProps) {
  const c = { ...DEFAULT_COLORS, ...colors }
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', ...style }}>
      {(Object.keys(ROLE_META) as AudienceRole[]).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          title={ROLE_META[r].description}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
            cursor: 'pointer', border: `1px solid ${value === r ? c.accent : c.border}`,
            background: value === r ? `${c.accent}18` : c.surface,
            color: value === r ? c.accent : c.muted,
          }}
        >
          {ROLE_META[r].emoji} {ROLE_META[r].label}
        </button>
      ))}
    </div>
  )
}
