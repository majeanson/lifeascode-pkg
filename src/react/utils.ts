import type { LacNode, LacStatus } from '../schema.js'
import type { LacTheme } from './theme.js'

export function getViewField(node: LacNode, path: string): unknown {
  const parts = path.split('.')
  let obj: unknown = node
  for (const part of parts) {
    if (obj == null || typeof obj !== 'object') return undefined
    obj = (obj as Record<string, unknown>)[part]
  }
  return obj
}

export function statusColor(status: LacStatus, theme: LacTheme): string {
  switch (status) {
    case 'draft': return theme.textMuted
    case 'active': return theme.accent
    case 'frozen': return '#4a9eff'
    case 'deprecated': return '#555555'
  }
}

export function statusBg(status: LacStatus, theme: LacTheme): string {
  switch (status) {
    case 'draft': return 'rgba(128,128,128,0.12)'
    case 'active': return theme.accentBg
    case 'frozen': return 'rgba(74,158,255,0.12)'
    case 'deprecated': return 'rgba(80,80,80,0.12)'
  }
}

export function priorityBadge(priority?: number): string {
  return priority ? `P${priority}` : '—'
}

export function typeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

function searchIn(val: unknown, q: string): boolean {
  if (typeof val === 'string') return val.toLowerCase().includes(q)
  if (Array.isArray(val)) return val.some((v) => searchIn(v, q))
  if (val !== null && typeof val === 'object') return Object.values(val as object).some((v) => searchIn(v, q))
  return false
}

export function nodeMatchesQuery(node: LacNode, query: string): boolean {
  if (!query.trim()) return false
  const q = query.toLowerCase()
  return (
    node.title.toLowerCase().includes(q) ||
    node.domain.toLowerCase().includes(q) ||
    node.type.toLowerCase().includes(q) ||
    (node.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
    searchIn(node.views, q)
  )
}
