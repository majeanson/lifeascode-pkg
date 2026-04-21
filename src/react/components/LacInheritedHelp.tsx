/**
 * LacInheritedHelp — makes the LAC parent/children relationship visible in the UI.
 *
 * Shows content inherited from a parent node first ("shared rules"), then the
 * child node's specific overrides ("this game specifically"). Mirrors how
 * inheritance works in code: base class first, subclass second.
 *
 * Works for any project — not just games. Any two nodes connected via
 * node.parent can be rendered this way.
 */
import React, { useState } from 'react'
import type { LacNode } from '../../schema.js'
import type { AudienceRole } from './LacRoleView.js'
import { ROLE_META } from './LacRoleView.js'
import { useLacNodeWithParent } from '../hooks.js'
import { LacNodeField } from './LacNodeField.js'
import { getViewField } from '../utils.js'

// ─── field map per role (mirrors LacHelpButton) ───────────────────────────────
const ROLE_FIELDS: Record<AudienceRole, Array<{ path: string; label?: string; isList?: boolean }>> = {
  user:    [{ path: 'views.user.userGuide' }, { path: 'views.user.knownLimitations', label: 'Keep in mind', isList: true }],
  dev:     [{ path: 'views.dev.componentFile', label: 'Component' }, { path: 'views.dev.implementation', label: 'Implementation' }, { path: 'views.dev.edgeCases', label: 'Edge cases' }],
  support: [{ path: 'views.support.steps', label: 'Steps', isList: true }, { path: 'views.support.escalationPath', label: 'Escalation' }],
  product: [{ path: 'views.product.problem', label: 'Problem' }, { path: 'views.product.acceptanceCriteria', label: 'Acceptance criteria', isList: true }],
  tester:  [{ path: 'views.tester.testCases', label: 'Test cases', isList: true }, { path: 'views.tester.edgeCases', label: 'Edge cases', isList: true }],
}

function hasAnyField(node: LacNode, fields: Array<{ path: string }>) {
  return fields.some((f) => {
    const v = getViewField(node, f.path)
    return v != null && v !== '' && !(Array.isArray(v) && v.length === 0)
  })
}

// ─── a single node's fields block ────────────────────────────────────────────
function NodeBlock({
  node,
  label,
  labelColor,
  connectorColor,
  isBase,
  role,
  colors: c,
}: {
  node: LacNode
  label: string
  labelColor: string
  connectorColor: string
  isBase: boolean
  role: AudienceRole
  colors: Required<NonNullable<LacInheritedHelpProps['colors']>>
}) {
  const fields = ROLE_FIELDS[role]
  if (!hasAnyField(node, fields)) return null

  return (
    <div style={{ position: 'relative' }}>
      {/* Inheritance badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: labelColor, background: `${labelColor}18`, border: `1px solid ${labelColor}30`, borderRadius: '20px', padding: '2px 10px' }}>
          {isBase ? '⬡ shared' : '◆ this game'}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: c.text }}>{node.title}</span>
      </div>

      {/* Content */}
      <div style={{ paddingLeft: '16px', borderLeft: `2px solid ${connectorColor}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fields.map((f) => (
            <LacNodeField
              key={f.path}
              node={node}
              field={f.path}
              label={f.label}
              as={f.isList ? 'list' : undefined}
              textColor={c.text}
              mutedColor={c.muted}
              accentColor={c.accent}
              fontSize="14px"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── props ────────────────────────────────────────────────────────────────────
export interface LacInheritedHelpProps {
  /** The child node ID (e.g. "feature-count-the-dots-g1a2") */
  nodeId: string
  /** Audience role — determines which fields to show */
  role?: AudienceRole
  /** Show a role picker above */
  showRolePicker?: boolean
  /** Whether to show the connector line between parent and child */
  showConnector?: boolean
  style?: React.CSSProperties
  colors?: {
    bg?: string
    surface?: string
    border?: string
    text?: string
    muted?: string
    accent?: string
    parentAccent?: string
  }
}

const DEFAULT_COLORS = {
  bg: '#f9f7f2',
  surface: '#ffffff',
  border: '#e0dbd3',
  text: '#1a1a2e',
  muted: '#6b6570',
  accent: '#7ec8a4',
  parentAccent: '#b0c4de',
}

export function LacInheritedHelp({
  nodeId,
  role: initialRole = 'user',
  showRolePicker = false,
  showConnector = true,
  style,
  colors,
}: LacInheritedHelpProps) {
  const [activeRole, setActiveRole] = useState<AudienceRole>(initialRole)
  const { node, parent } = useLacNodeWithParent(nodeId)
  const c = { ...DEFAULT_COLORS, ...colors }

  if (!node) return null

  const hasParent = !!parent && hasAnyField(parent, ROLE_FIELDS[activeRole])
  const hasChild = hasAnyField(node, ROLE_FIELDS[activeRole])

  return (
    <div style={{ background: c.bg, ...style }}>
      {/* Role picker */}
      {showRolePicker && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {(Object.keys(ROLE_META) as AudienceRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRole(r)}
              style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: `1px solid ${activeRole === r ? c.accent : c.border}`, background: activeRole === r ? `${c.accent}18` : 'transparent', color: activeRole === r ? c.accent : c.muted }}
            >
              {ROLE_META[r].emoji} {ROLE_META[r].label}
            </button>
          ))}
        </div>
      )}

      {!hasParent && !hasChild && (
        <p style={{ color: c.muted, fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
          No {ROLE_META[activeRole].label.toLowerCase()} content yet.
        </p>
      )}

      {/* Parent block (base class) */}
      {hasParent && parent && (
        <NodeBlock
          node={parent}
          label="shared"
          labelColor={c.parentAccent}
          connectorColor={c.parentAccent}
          isBase
          role={activeRole}
          colors={c}
        />
      )}

      {/* Connector between parent and child */}
      {hasParent && hasChild && showConnector && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
          <div style={{ width: '24px', height: '1px', background: c.border }} />
          <span style={{ fontSize: '10px', color: c.muted, fontStyle: 'italic' }}>extended by</span>
          <div style={{ flex: 1, height: '1px', background: c.border }} />
        </div>
      )}

      {/* Child block (specific overrides) */}
      {hasChild && (
        <NodeBlock
          node={node}
          label="this game"
          labelColor={c.accent}
          connectorColor={c.accent}
          isBase={false}
          role={activeRole}
          colors={c}
        />
      )}
    </div>
  )
}

// ─── LacHelpButton variant with inheritance baked in ─────────────────────────
export interface LacInheritedHelpButtonProps {
  nodeId: string
  role?: AudienceRole
  allowRoleSwitch?: boolean
  label?: string | React.ReactNode
  position?: 'fixed' | 'inline'
  style?: React.CSSProperties
  colors?: LacInheritedHelpProps['colors']
}

export function LacInheritedHelpButton({
  nodeId,
  role: initialRole = 'user',
  allowRoleSwitch = false,
  label = '?',
  position = 'inline',
  style,
  colors,
}: LacInheritedHelpButtonProps) {
  const [open, setOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<AudienceRole>(initialRole)
  const { node } = useLacNodeWithParent(nodeId)
  const c = { ...DEFAULT_COLORS, ...colors }

  if (!node) return null

  const btnStyle: React.CSSProperties = {
    width: '34px', height: '34px', borderRadius: '50%',
    background: c.accent, color: '#fff',
    border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '15px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    ...(position === 'fixed' ? { position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' } : {}),
    ...style,
  }

  return (
    <>
      <button style={btnStyle} onClick={() => setOpen(true)} aria-label={`Help for ${node.title}`}>
        {label}
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9001, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(26,26,46,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{ width: '100%', maxWidth: '560px', maxHeight: '82vh', background: c.bg, borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: c.text }}>{node.title}</div>
                {allowRoleSwitch && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {(Object.keys(ROLE_META) as AudienceRole[]).map((r) => (
                      <button key={r} onClick={() => setActiveRole(r)}
                        style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${activeRole === r ? c.accent : c.border}`, background: activeRole === r ? `${c.accent}20` : 'transparent', color: activeRole === r ? c.accent : c.muted }}>
                        {ROLE_META[r].emoji} {ROLE_META[r].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: c.muted, padding: '0 0 0 12px' }}>×</button>
            </div>

            {/* Body — inherited content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <LacInheritedHelp
                nodeId={nodeId}
                role={activeRole}
                showConnector
                colors={c}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
