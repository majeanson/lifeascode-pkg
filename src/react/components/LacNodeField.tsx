import React from 'react'
import type { LacNode } from '../../schema.js'
import { getViewField } from '../utils.js'
import { MarkdownField } from './MarkdownField.js'

export type LacNodeFieldAs = 'prose' | 'list' | 'code' | 'badge' | 'raw'

export interface LacNodeFieldProps {
  /** The node object (use useLacNode to get it) */
  node: LacNode
  /** Dot-path to the field, e.g. "views.user.userGuide" or "views.dev.componentFile" */
  field: string
  /** How to render the value. Defaults to auto-detect (list → bullets, string → prose) */
  as?: LacNodeFieldAs
  /** Show a label above the value */
  label?: string
  /** Style overrides on the wrapper */
  style?: React.CSSProperties
  textColor?: string
  mutedColor?: string
  accentColor?: string
  fontSize?: string
}

export function LacNodeField({
  node,
  field,
  as,
  label,
  style,
  textColor = '#1a1a2e',
  mutedColor = '#6b6570',
  accentColor = '#7ec8a4',
  fontSize = '14px',
}: LacNodeFieldProps) {
  const raw = getViewField(node, field)
  if (raw == null || raw === '' || (Array.isArray(raw) && raw.length === 0)) return null

  const renderAs = as ?? (Array.isArray(raw) ? 'list' : 'prose')

  const content = (() => {
    switch (renderAs) {
      case 'list':
        return (
          <ul style={{ margin: '4px 0 0', padding: '0 0 0 18px', listStyle: 'disc' }}>
            {(Array.isArray(raw) ? raw : [raw]).map((item, i) => (
              <li key={i} style={{ fontSize, color: textColor, lineHeight: 1.6, marginBottom: '2px' }}>
                {String(item)}
              </li>
            ))}
          </ul>
        )
      case 'code':
        return (
          <code style={{ display: 'block', fontSize: '12px', background: 'rgba(0,0,0,0.05)', padding: '6px 10px', borderRadius: '6px', color: accentColor, fontFamily: 'monospace', marginTop: '4px' }}>
            {String(raw)}
          </code>
        )
      case 'badge':
        return (
          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40`, marginTop: '4px' }}>
            {String(raw)}
          </span>
        )
      case 'raw':
        return <span style={{ fontSize, color: textColor }}>{String(raw)}</span>
      case 'prose':
      default: {
        const minTheme = { text: textColor, textMuted: mutedColor, accent: accentColor, surface: 'transparent', border: 'transparent', bg: 'transparent', accentBg: 'transparent', borderRadiusSm: '4px', borderRadius: '8px' }
        return <MarkdownField content={String(raw)} theme={minTheme as never} />
      }
    }
  })()

  return (
    <div style={style}>
      {label && (
        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: mutedColor, marginBottom: '4px' }}>
          {label}
        </div>
      )}
      {content}
    </div>
  )
}
