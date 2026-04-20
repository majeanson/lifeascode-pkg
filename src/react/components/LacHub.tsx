import React, { useState } from 'react'
import type { LacGraph } from '../../schema.js'
import type { LacTheme, LacThemeMode } from '../theme.js'
import { LacDataProvider } from '../context.js'
import { useLacData } from '../hooks.js'
import { LacSprintBoard } from './LacSprintBoard.js'
import { LacGuide } from './LacGuide.js'
import { LacDecisionLog } from './LacDecisionLog.js'
import { LacSuccessBoard } from './LacSuccessBoard.js'
import { LacSearch } from './LacSearch.js'

export type HubTab = 'sprint' | 'guide' | 'decisions' | 'success' | 'search'

export interface LacHubProps {
  dataUrl?: string
  data?: LacGraph
  defaultTab?: HubTab
  theme?: LacThemeMode | Partial<LacTheme>
  themeOverrides?: Partial<LacTheme>
  guideUrl?: string
  style?: React.CSSProperties
  fullscreen?: boolean
}

const TABS: Array<{ id: HubTab; label: string }> = [
  { id: 'sprint', label: 'Sprint' },
  { id: 'guide', label: 'Guide' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'success', label: 'Success' },
  { id: 'search', label: 'Search' },
]

function HubInner({ defaultTab = 'sprint', guideUrl, style, fullscreen }: Omit<LacHubProps, 'dataUrl' | 'data' | 'theme' | 'themeOverrides'>) {
  const { theme, loading, error } = useLacData()
  const [tab, setTab] = useState<HubTab>(defaultTab)

  const containerStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily,
    background: theme.bg,
    color: theme.text,
    border: fullscreen ? 'none' : `1px solid ${theme.border}`,
    borderRadius: fullscreen ? '0' : theme.borderRadius,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '400px',
    ...style,
  }

  if (loading) return <div style={containerStyle}><div style={{ padding: '24px', color: theme.textMuted }}>Loading…</div></div>
  if (error) return <div style={containerStyle}><div style={{ padding: '24px', color: '#ff6b6b' }}>Error: {error}</div></div>

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, background: theme.surface }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? `2px solid ${theme.accent}` : '2px solid transparent',
              color: tab === t.id ? theme.accent : theme.textMuted,
              cursor: 'pointer',
              fontFamily: theme.fontFamily,
              fontSize: '13px',
              fontWeight: tab === t.id ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        {guideUrl && (
          <a href={guideUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', padding: '10px 16px', color: theme.accent, fontSize: '13px', textDecoration: 'none' }}>
            Open guide →
          </a>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'sprint' && <LacSprintBoard />}
        {tab === 'guide' && <LacGuide />}
        {tab === 'decisions' && <LacDecisionLog />}
        {tab === 'success' && <LacSuccessBoard />}
        {tab === 'search' && <LacSearch autoFocus />}
      </div>
    </div>
  )
}

export function LacHub({ dataUrl, data, defaultTab, theme, themeOverrides, guideUrl, style, fullscreen }: LacHubProps) {
  return (
    <LacDataProvider dataUrl={dataUrl} data={data} theme={theme} themeOverrides={themeOverrides}>
      <HubInner defaultTab={defaultTab} guideUrl={guideUrl} style={style} fullscreen={fullscreen} />
    </LacDataProvider>
  )
}
