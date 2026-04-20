import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { LacNode } from './schema.js'

export function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
}

export function generateId(type: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  const rand = Math.random().toString(36).slice(2, 6)
  return `${type}-${slug}-${rand}`
}

export function scanNodes(dir: string): string[] {
  const results: string[] = []
  if (!existsSync(dir)) return results
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...scanNodes(full))
    } else if (
      entry.name === 'node.md' ||
      entry.name === 'node.json' ||
      entry.name === 'nodes.json'
    ) {
      results.push(full)
    }
  }
  return results
}

export function computeCompleteness(node: LacNode, requiredViews: string[]): number {
  if (requiredViews.length === 0) return 100
  let filled = 0
  for (const viewId of requiredViews) {
    const view = getNestedValue(node, `views.${viewId}`)
    if (!isEmpty(view)) filled++
  }
  return Math.round((filled / requiredViews.length) * 100)
}

export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
