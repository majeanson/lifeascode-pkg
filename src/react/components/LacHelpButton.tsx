import React, { useEffect, useRef, useState } from 'react'
import type { AudienceRole } from './LacRoleView.js'
import { ROLE_META } from './LacRoleView.js'
import { useLacNode } from '../hooks.js'
import { LacNodeField } from './LacNodeField.js'
import { getViewField } from '../utils.js'

// ─── field map per role ───────────────────────────────────────────────────────
const ROLE_FIELDS: Record<AudienceRole, Array<{ path: string; label?: string; isList?: boolean }>> = {
  user:    [{ path: 'views.user.userGuide' }, { path: 'views.user.knownLimitations', label: 'Keep in mind', isList: true }],
  dev:     [{ path: 'views.dev.componentFile', label: 'Component' }, { path: 'views.dev.implementation', label: 'Implementation' }, { path: 'views.dev.edgeCases', label: 'Edge cases' }],
  support: [{ path: 'views.support.steps', label: 'Steps', isList: true }, { path: 'views.support.escalationPath', label: 'Escalation' }, { path: 'views.support.rollback', label: 'Rollback' }],
  product: [{ path: 'views.product.problem', label: 'Problem' }, { path: 'views.product.acceptanceCriteria', label: 'Acceptance criteria', isList: true }],
  tester:  [{ path: 'views.tester.testCases', label: 'Test cases', isList: true }, { path: 'views.tester.edgeCases', label: 'Edge cases', isList: true }],
}

export interface LacHelpButtonProps {
  /** Node ID to show help for */
  nodeId: string
  /** Which audience lens to show. Defaults to 'user' */
  role?: AudienceRole
  /** Allow switching roles inside the drawer */
  allowRoleSwitch?: boolean
  /** Button label. Defaults to "?" */
  label?: string | React.ReactNode
  /** 'fixed' positions in corner of viewport; 'inline' renders as a normal button */
  position?: 'fixed' | 'inline'
  style?: React.CSSProperties
  colors?: {
    bg?: string
    surface?: string
    border?: string
    text?: string
    muted?: string
    accent?: string
    buttonBg?: string
    buttonText?: string
    overlay?: string
  }
}

const DEFAULT_COLORS = {
  bg: '#f9f7f2',
  surface: '#ffffff',
  border: '#e0dbd3',
  text: '#1a1a2e',
  muted: '#6b6570',
  accent: '#7ec8a4',
  buttonBg: '#7ec8a4',
  buttonText: '#ffffff',
  overlay: 'rgba(26,26,46,0.4)',
}

export function LacHelpButton({
  nodeId,
  role: initialRole = 'user',
  allowRoleSwitch = false,
  label = '?',
  position = 'inline',
  style,
  colors,
}: LacHelpButtonProps) {
  const [open, setOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<AudienceRole>(initialRole)
  const drawerRef = useRef<HTMLDivElement>(null)
  const node = useLacNode(nodeId)
  const c = { ...DEFAULT_COLORS, ...colors }

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const btnStyle: React.CSSProperties = {
    width: '36px', height: '36px', borderRadius: '50%',
    background: c.buttonBg, color: c.buttonText,
    border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    ...(position === 'fixed' ? { position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' } : {}),
    ...style,
  }

  if (!node) return null

  const fields = ROLE_FIELDS[activeRole]
  const hasContent = fields.some((f) => {
    const val = getViewField(node, f.path)
    return val != null && val !== '' && !(Array.isArray(val) && val.length === 0)
  })

  return (
    <>
      <button style={btnStyle} onClick={() => setOpen(true)} aria-label={`Help for ${node.title}`}>
        {label}
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9001, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: c.overlay }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            ref={drawerRef}
            style={{ width: '100%', maxWidth: '560px', maxHeight: '80vh', background: c.bg, borderRadius: '16px 16px 0 0', padding: '0 0 32px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: c.text }}>{node.title}</div>
                {allowRoleSwitch && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {(Object.keys(ROLE_META) as AudienceRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setActiveRole(r)}
                        style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${activeRole === r ? c.accent : c.border}`, background: activeRole === r ? `${c.accent}20` : 'transparent', color: activeRole === r ? c.accent : c.muted }}
                      >
                        {ROLE_META[r].emoji} {ROLE_META[r].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: c.muted, lineHeight: 1, padding: '4px' }}>×</button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {!hasContent ? (
                <p style={{ color: c.muted, fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                  No {ROLE_META[activeRole].label.toLowerCase()} content for this node yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      fontSize="15px"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
