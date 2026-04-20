import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { LacGraph } from '../schema.js'
import type { LacTheme, LacThemeMode } from './theme.js'
import { resolveTheme } from './theme.js'

interface LacContextValue {
  graph: LacGraph | null
  loading: boolean
  error: string | null
  theme: LacTheme
  refetch: () => void
}

const LacContext = createContext<LacContextValue | null>(null)

export interface LacDataProviderProps {
  dataUrl: string
  children: React.ReactNode
  theme?: LacThemeMode | Partial<LacTheme>
  themeOverrides?: Partial<LacTheme>
}

export function LacDataProvider({ dataUrl, children, theme = 'dark', themeOverrides }: LacDataProviderProps) {
  const [graph, setGraph] = useState<LacGraph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resolvedTheme = useMemo(() => {
    if (typeof theme === 'string') return resolveTheme(theme, themeOverrides)
    return resolveTheme('dark', { ...theme, ...themeOverrides })
  }, [theme, themeOverrides])

  const fetchGraph = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(dataUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${dataUrl}. Run "lac build" first.`)
      setGraph(await res.json() as LacGraph)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [dataUrl])

  useEffect(() => { fetchGraph() }, [fetchGraph])

  const value = useMemo(
    () => ({ graph, loading, error, theme: resolvedTheme, refetch: fetchGraph }),
    [graph, loading, error, resolvedTheme, fetchGraph]
  )

  return <LacContext.Provider value={value}>{children}</LacContext.Provider>
}

export function useLacContext(): LacContextValue {
  const ctx = useContext(LacContext)
  if (!ctx) throw new Error('useLacContext must be called inside a <LacDataProvider>.')
  return ctx
}
