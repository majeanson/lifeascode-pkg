import React from 'react'
import type { AudienceRole } from './LacRoleView.js'
import { LacRoleView, LacRoleSwitcher } from './LacRoleView.js'
import { LacNodeField } from './LacNodeField.js'
import { useLacData, useLacNodesByType } from '../hooks.js'
import { useState } from 'react'

export interface LacAboutProps {
  /**
   * Default audience role. Pass `showRoleSwitcher` to let the viewer pick.
   * Defaults to 'user' — the grandparent-readable view.
   */
  role?: AudienceRole
  showRoleSwitcher?: boolean
  /** Limit to a specific domain (e.g. 'games' shows only game nodes) */
  domain?: string | string[]
  /** Layout for the role view section */
  layout?: 'accordion' | 'flat'
  style?: React.CSSProperties
  colors?: {
    bg?: string
    surface?: string
    border?: string
    text?: string
    muted?: string
    accent?: string
    accentDark?: string
  }
}

const DEFAULT_COLORS = {
  bg: '#f9f7f2',
  surface: '#ffffff',
  border: '#e0dbd3',
  text: '#1a1a2e',
  muted: '#6b6570',
  accent: '#7ec8a4',
  accentDark: '#4da87e',
}

export function LacAbout({
  role: initialRole = 'user',
  showRoleSwitcher = false,
  domain,
  layout = 'accordion',
  style,
  colors,
}: LacAboutProps) {
  const [activeRole, setActiveRole] = useState<AudienceRole>(initialRole)
  const { graph } = useLacData()
  const epics = useLacNodesByType('epic')
  const c = { ...DEFAULT_COLORS, ...colors }

  const epic = epics[0] // Use first epic as the project vision

  return (
    <div style={{ background: c.bg, ...style }}>
      {/* Project vision — from the epic node */}
      {epic && (
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: c.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {epic.title}
          </h1>
          {graph?.project && epic.title !== graph.project && (
            <div style={{ fontSize: '12px', color: c.muted, marginBottom: '16px' }}>
              {graph.project}
            </div>
          )}
          <LacNodeField
            node={epic}
            field="views.product.problem"
            style={{ marginBottom: '16px' }}
            textColor={c.text}
            mutedColor={c.muted}
            accentColor={c.accent}
            fontSize="16px"
          />
          <LacNodeField
            node={epic}
            field="views.product.successCriteria"
            label="Success looks like"
            textColor={c.text}
            mutedColor={c.muted}
            accentColor={c.accent}
            fontSize="15px"
          />
        </div>
      )}

      {/* Role switcher */}
      {showRoleSwitcher && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: c.muted, marginBottom: '8px' }}>
            I am a…
          </div>
          <LacRoleSwitcher
            value={activeRole}
            onChange={setActiveRole}
            colors={{ surface: c.surface, border: c.border, muted: c.muted, accent: c.accent }}
          />
        </div>
      )}

      {/* Role-specific content */}
      <LacRoleView
        role={activeRole}
        domain={domain}
        layout={layout}
        colors={{ bg: c.bg, surface: c.surface, border: c.border, text: c.text, muted: c.muted, accent: c.accent }}
      />
    </div>
  )
}
