import React, { useState } from 'react'
import type { LacNode } from '../../schema.js'
import type { LacTheme } from '../theme.js'
import { useLacData, useLacNodesByType } from '../hooks.js'
import { getViewField, statusBg, statusColor } from '../utils.js'
import { LacFeatureCard } from './LacFeatureCard.js'

export interface LacDecisionLogProps {
  theme?: LacTheme
  onNodeClick?: (node: LacNode) => void
}

export function LacDecisionLog({ theme: propTheme, onNodeClick }: LacDecisionLogProps) {
  const { theme: ctxTheme } = useLacData()
  const t = propTheme ?? ctxTheme
  const decisions = useLacNodesByType('decision')
  const [selected, setSelected] = useState<LacNode | null>(null)

  const handleClick = (node: LacNode) => {
    if (onNodeClick) { onNodeClick(node) } else { setSelected(node) }
  }

  if (selected) {
    return <LacFeatureCard node={selected} theme={t} defaultView="dev" onClose={() => setSelected(null)} style={{ margin: '16px' }} />
  }

  return (
    <div style={{ padding: '16px' }}>
      {decisions.length === 0 && <div style={{ color: t.textMuted, padding: '24px 0', textAlign: 'center' }}>No decision nodes yet.</div>}
      {decisions.map((node) => (
        <div key={node.id} onClick={() => handleClick(node)} style={{ padding: '12px', marginBottom: '8px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.borderRadiusSm, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: statusBg(node.status, t), color: statusColor(node.status, t), padding: '2px 6px', borderRadius: t.borderRadiusSm, fontSize: '11px' }}>{node.status}</span>
            <span style={{ color: t.text, fontSize: '14px', fontWeight: 500 }}>{node.title}</span>
          </div>
          {!!getViewField(node, 'views.dev.choice') && (
            <div style={{ color: t.textMuted, fontSize: '12px' }}>Choice: {getViewField(node, 'views.dev.choice') as string}</div>
          )}
        </div>
      ))}
    </div>
  )
}
