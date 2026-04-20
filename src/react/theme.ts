export interface LacTheme {
  bg: string
  surface: string
  surfaceHover: string
  border: string
  text: string
  textMuted: string
  accent: string
  accentBg: string
  fontFamily: string
  fontMono: string
  borderRadius: string
  borderRadiusSm: string
}

export type LacThemeMode = 'dark' | 'light' | 'system'

export const DARK_THEME: LacTheme = {
  bg: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceHover: '#222222',
  border: '#2a2a2a',
  text: '#e0e0e0',
  textMuted: '#888888',
  accent: '#c4a255',
  accentBg: 'rgba(196,162,85,0.12)',
  fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
  fontMono: '"Fira Code","JetBrains Mono",Consolas,"Courier New",monospace',
  borderRadius: '8px',
  borderRadiusSm: '4px',
}

export const LIGHT_THEME: LacTheme = {
  bg: '#ffffff',
  surface: '#f7f7f7',
  surfaceHover: '#eeeeee',
  border: '#e0e0e0',
  text: '#1a1a1a',
  textMuted: '#666666',
  accent: '#a07830',
  accentBg: 'rgba(160,120,48,0.10)',
  fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
  fontMono: '"Fira Code","JetBrains Mono",Consolas,"Courier New",monospace',
  borderRadius: '8px',
  borderRadiusSm: '4px',
}

export function resolveTheme(mode: LacThemeMode, overrides?: Partial<LacTheme>): LacTheme {
  let base: LacTheme
  if (mode === 'system') {
    base = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? DARK_THEME : LIGHT_THEME
  } else {
    base = mode === 'dark' ? DARK_THEME : LIGHT_THEME
  }
  return overrides ? { ...base, ...overrides } : base
}
