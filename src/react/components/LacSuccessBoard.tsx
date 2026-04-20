import React from 'react'
import type { LacNode } from '../../schema.js'
import type { LacTheme } from '../theme.js'
import { useLacData, useLacSuccessCriteria } from '../hooks.js'
import { getViewField, statusBg, statusColor } from '../utils.js'
import { LacFeatureCard } from './LacFeatureCard.js'
import { useState } from 'react'

export interface LacSuccessBoardProps {
  theme?: LacTheme
  onNodeClick?: (node: LacNode) => void
}

export function LacSuccessBoard({ theme: propTheme, onNodeClick }: LacSuccessBoardProps) {
  const { theme: ctxTheme } = useLacData()
  const t = propTheme ?? ctxTheme
  const nodes = useLacSuccessCriteria()
  const [selected, setSelected] = useState<LacNode | null>(null)

  const handleClick = (node: LacNode) => {
    if (onNodeClick) { onNodeClick(node) } else { setSelected(node) }
  }

  if (selected) {
    return <LacFeatureCard node={selected} theme={t} defaultView="product" onClose={() => setSelected(null)} style={{ margin: '16px' }} />
  }

  return (
    <div style={{ padding: '16px' }}>
      {nodes.length === 0 && <div style={{ color: t.textMuted, padding: '24px 0', textAlign: 'center' }}>No nodes with success criteria.</div>}
      {nodes.map((node) => {
        const sc = getViewField(node, 'views.product.successCriteria') as string | undefined
        return (
          <div key={node.id} onClick={() => handleClick(node)} style={{ padding: '12px', marginBottom: '8px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.borderRadiusSm, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: sc ? '6px' : 0 }}>
              <span style={{ background: statusBg(node.status, t), color: statusColor(node.status, t), padding: '2px 6px', borderRadius: t.borderRadiusSm, fontSize: '11px' }}>{node.status}</span>
              <span style={{ color: t.text, fontSize: '14px', fontWeight: 500 }}>{node.title}</span>
              <span style={{ fontSize: '10px', color: t.textMuted, background: 'rgba(128,128,128,0.1)', borderRadius: '10px', padding: '1px 7px', marginLeft: 'auto' }}>{node.domain}</span>
            </div>
            {sc && <div style={{ color: t.textMuted, fontSize: '13px', whiteSpace: 'pre-wrap' }}>{String(sc).slice(0, 200)}</div>}
          </div>
        )
      })}
    </div>
  )
}
