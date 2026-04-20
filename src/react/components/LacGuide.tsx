import React, { useState } from 'react'
import type { LacNode } from '../../schema.js'
import type { LacTheme } from '../theme.js'
import { useLacData, useLacNodesByType } from '../hooks.js'
import { getViewField, typeLabel } from '../utils.js'
import { LacFeatureCard } from './LacFeatureCard.js'

export interface LacGuideProps {
  theme?: LacTheme
  onNodeClick?: (node: LacNode) => void
}

export function LacGuide({ theme: propTheme, onNodeClick }: LacGuideProps) {
  const { theme: ctxTheme } = useLacData()
  const t = propTheme ?? ctxTheme
  const faqs = useLacNodesByType('faq')
  const runbooks = useLacNodesByType('runbook')
  const features = useLacNodesByType('feature')
  const guideNodes = [...faqs, ...runbooks, ...features.filter((n) => n.status === 'frozen')]
  const [selected, setSelected] = useState<LacNode | null>(null)

  const handleClick = (node: LacNode) => {
    if (onNodeClick) { onNodeClick(node) } else { setSelected(node) }
  }

  if (selected) {
    return <LacFeatureCard node={selected} theme={t} defaultView="user" onClose={() => setSelected(null)} style={{ margin: '16px' }} />
  }

  return (
    <div style={{ padding: '16px' }}>
      {guideNodes.length === 0 && <div style={{ color: t.textMuted, padding: '24px 0', textAlign: 'center' }}>No guide content yet. Freeze features or add FAQ / Runbook nodes.</div>}
      {guideNodes.map((node) => (
        <div key={node.id} onClick={() => handleClick(node)} style={{ padding: '12px', marginBottom: '8px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.borderRadiusSm, cursor: 'pointer' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: t.accent, fontSize: '11px', textTransform: 'uppercase' }}>{typeLabel(node.type)}</span>
            <span style={{ color: t.text, fontSize: '14px' }}>{node.title}</span>
          </div>
          {!!getViewField(node, 'views.user.userGuide') && (
            <div style={{ color: t.textMuted, fontSize: '12px', marginTop: '4px' }}>
              {String(getViewField(node, 'views.user.userGuide')).slice(0, 120)}…
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
