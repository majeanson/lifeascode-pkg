import React, { useState } from 'react'
import type { LacNode } from '../../schema.js'
import type { LacTheme } from '../theme.js'
import { useLacData, useLacSearch } from '../hooks.js'
import { statusBg, statusColor, typeLabel } from '../utils.js'
import { LacFeatureCard } from './LacFeatureCard.js'

export interface LacSearchProps {
  theme?: LacTheme
  placeholder?: string
  onNodeClick?: (node: LacNode) => void
  autoFocus?: boolean
  value?: string
  onChange?: (query: string) => void
}

export function LacSearch({ theme: propTheme, placeholder = 'Search nodes…', onNodeClick, autoFocus, value: controlled, onChange: onChangeProp }: LacSearchProps) {
  const { theme: ctxTheme } = useLacData()
  const t = propTheme ?? ctxTheme
  const [internal, setInternal] = useState('')
  const query = controlled ?? internal
  const results = useLacSearch(query)
  const [selected, setSelected] = useState<LacNode | null>(null)

  const handleChange = (q: string) => {
    if (onChangeProp) { onChangeProp(q) } else { setInternal(q) }
    setSelected(null)
  }

  const handleClick = (node: LacNode) => {
    if (onNodeClick) { onNodeClick(node) } else { setSelected(node) }
  }

  if (selected) {
    return <LacFeatureCard node={selected} theme={t} onClose={() => setSelected(null)} style={{ margin: '16px' }} />
  }

  return (
    <div style={{ padding: '16px' }}>
      <input autoFocus={autoFocus} value={query} onChange={(e) => handleChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 12px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.borderRadiusSm, color: t.text, fontFamily: t.fontFamily, fontSize: '14px', boxSizing: 'border-box', outline: 'none', marginBottom: '12px' }}
      />
      {query && results.length === 0 && <div style={{ color: t.textMuted, textAlign: 'center', padding: '16px 0' }}>No results.</div>}
      {results.map((node) => (
        <div key={node.id} onClick={() => handleClick(node)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', marginBottom: '6px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.borderRadiusSm, cursor: 'pointer' }}>
          <span style={{ background: statusBg(node.status, t), color: statusColor(node.status, t), padding: '2px 6px', borderRadius: t.borderRadiusSm, fontSize: '11px' }}>{node.status}</span>
          <span style={{ color: t.textMuted, fontSize: '12px' }}>{typeLabel(node.type)}</span>
          <span style={{ flex: 1, color: t.text, fontSize: '14px' }}>{node.title}</span>
        </div>
      ))}
    </div>
  )
}
