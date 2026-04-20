import React, { useState } from 'react'
import type { LacNode } from '../../schema.js'
import type { LacTheme } from '../theme.js'
import { useLacData, useLacSprint } from '../hooks.js'
import { priorityBadge, statusBg, statusColor, typeLabel } from '../utils.js'
import { LacFeatureCard } from './LacFeatureCard.js'

export interface LacSprintBoardProps {
  theme?: LacTheme
  domains?: string[]
  onNodeClick?: (node: LacNode) => void
}

export function LacSprintBoard({ theme: propTheme, domains, onNodeClick }: LacSprintBoardProps) {
  const { theme: ctxTheme } = useLacData()
  const t = propTheme ?? ctxTheme
  const nodes = useLacSprint()
  const [selected, setSelected] = useState<LacNode | null>(null)

  const filtered = domains ? nodes.filter((n) => domains.includes(n.domain)) : nodes

  const handleClick = (node: LacNode) => {
    if (onNodeClick) { onNodeClick(node) } else { setSelected(node) }
  }

  if (selected) {
    return <LacFeatureCard node={selected} theme={t} onClose={() => setSelected(null)} style={{ margin: '16px' }} />
  }

  return (
    <div style={{ padding: '16px' }}>
      {filtered.length === 0 && <div style={{ color: t.textMuted, padding: '24px 0', textAlign: 'center' }}>No active or draft nodes.</div>}
      {filtered.map((node) => (
        <div key={node.id} onClick={() => handleClick(node)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '6px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.borderRadiusSm, cursor: 'pointer' }}>
          <span style={{ color: t.textMuted, fontSize: '12px', minWidth: '28px' }}>{priorityBadge(node.priority)}</span>
          <span style={{ background: statusBg(node.status, t), color: statusColor(node.status, t), padding: '2px 6px', borderRadius: t.borderRadiusSm, fontSize: '11px' }}>{node.status}</span>
          <span style={{ color: t.textMuted, fontSize: '12px' }}>{typeLabel(node.type)}</span>
          <span style={{ flex: 1, color: t.text, fontSize: '14px' }}>{node.title}</span>
          <span style={{ color: t.textMuted, fontSize: '12px' }}>{node.domain}</span>
        </div>
      ))}
    </div>
  )
}
