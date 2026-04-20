import React, { useMemo } from 'react'
import type { LacTheme } from '../theme.js'
import { useLacData, useLacNode, useLacSearch } from '../hooks.js'
import { LacFeatureCard } from './LacFeatureCard.js'

export interface LacHelpPanelProps {
  nodeId?: string
  query?: string
  theme?: LacTheme
  open?: boolean
  onClose?: () => void
  position?: 'inline' | 'right' | 'bottom'
  style?: React.CSSProperties
}

export function LacHelpPanel({ nodeId, query, theme: propTheme, open = true, onClose, position = 'inline', style }: LacHelpPanelProps) {
  const { theme: ctxTheme, nodes: allNodes } = useLacData()
  const t = propTheme ?? ctxTheme
  const directNode = useLacNode(nodeId ?? '')
  const searchResults = useLacSearch(nodeId ? '' : (query ?? ''))
  const node = directNode ?? searchResults[0]

  const nodeIndex = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes])

  if (!open) return null

  const positionStyle: React.CSSProperties =
    position === 'right'
      ? { position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px', zIndex: 1000, overflow: 'auto' }
      : position === 'bottom'
      ? { position: 'fixed', bottom: 0, left: 0, right: 0, maxHeight: '50vh', zIndex: 1000, overflow: 'auto' }
      : {}

  return (
    <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: t.borderRadius, ...positionStyle, ...style }}>
      {!node && <div style={{ padding: '16px', color: t.textMuted }}>No help content found{query ? ` for "${query}"` : ''}.</div>}
      {node && (
        <LacFeatureCard
          node={node}
          theme={t}
          defaultView="user"
          onClose={onClose}
          nodeIndex={nodeIndex}
        />
      )}
    </div>
  )
}
