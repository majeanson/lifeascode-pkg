import { useMemo } from 'react'
import type { LacNode, LacStatus } from '../schema.js'
import { useLacContext } from './context.js'
import { nodeMatchesQuery } from './utils.js'

export function useLacData() {
  const { graph, loading, error, theme, refetch } = useLacContext()
  return {
    graph,
    nodes: graph?.nodes ?? [],
    edges: graph?.edges ?? [],
    domains: graph?.meta.domains ?? [],
    loading,
    error,
    theme,
    refetch,
  }
}

export function useLacNode(id: string): LacNode | undefined {
  const { graph } = useLacContext()
  return useMemo(() => graph?.nodes.find((n) => n.id === id), [graph, id])
}

export function useLacNodesByType(type: string): LacNode[] {
  const { graph } = useLacContext()
  return useMemo(() => (graph?.nodes ?? []).filter((n) => n.type === type), [graph, type])
}

export function useLacNodesByStatus(status: LacStatus): LacNode[] {
  const { graph } = useLacContext()
  return useMemo(() => (graph?.nodes ?? []).filter((n) => n.status === status), [graph, status])
}

export function useLacNodesByDomain(domain: string): LacNode[] {
  const { graph } = useLacContext()
  return useMemo(() => (graph?.nodes ?? []).filter((n) => n.domain === domain), [graph, domain])
}

export function useLacSearch(query: string): LacNode[] {
  const { graph } = useLacContext()
  return useMemo(() => {
    if (!query.trim()) return []
    return (graph?.nodes ?? []).filter((n) => nodeMatchesQuery(n, query))
  }, [graph, query])
}

export function useLacSprint(): LacNode[] {
  const { graph } = useLacContext()
  return useMemo(() => {
    return (graph?.nodes ?? [])
      .filter((n) => n.status === 'active' || n.status === 'draft')
      .sort((a, b) => {
        const pa = a.priority ?? 99
        const pb = b.priority ?? 99
        if (pa !== pb) return pa - pb
        return a.title.localeCompare(b.title)
      })
  }, [graph])
}

export function useLacSuccessCriteria(): LacNode[] {
  const { graph } = useLacContext()
  return useMemo(() => {
    return (graph?.nodes ?? []).filter((n) => {
      const sc = n.views['product']?.['successCriteria']
      const ac = n.views['product']?.['acceptanceCriteria']
      return (typeof sc === 'string' && sc.trim().length > 0) || (Array.isArray(ac) && ac.length > 0)
    })
  }, [graph])
}
