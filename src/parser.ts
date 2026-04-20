import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import matter from 'gray-matter'
import { LacNodeSchema, type LacNode } from './schema.js'

// Fields that live in markdown body sections (## view.field) rather than YAML frontmatter
const PROSE_FIELDS = new Set([
  'implementation',
  'userGuide',
  'problem',
  'successCriteria',
  'rationale',
  'choice',
  'impact',
  'edgeCases',
  'testCases',
  'expectedBehavior',
  'supportNotes',
  'escalationPath',
  'internalNotes',
  'rollback',
  'releaseNotes',
])

// Known view IDs that may appear as top-level keys in frontmatter (shorthand notation)
const KNOWN_VIEW_IDS = ['dev', 'product', 'user', 'tester', 'support'] as const

function resolveRef(value: string, nodeDir: string): string | null {
  const filePath = join(nodeDir, value.slice(1))
  if (!existsSync(filePath)) return null
  return readFileSync(filePath, 'utf-8').trim()
}

function resolveRefs(obj: unknown, nodeDir: string): unknown {
  if (typeof obj === 'string') return obj.startsWith('@') ? (resolveRef(obj, nodeDir) ?? obj) : obj
  if (Array.isArray(obj)) return obj.map((v) => resolveRefs(v, nodeDir))
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, resolveRefs(v, nodeDir)])
    )
  }
  return obj
}

export function parseMarkdownSections(
  content: string
): Array<{ view: string; field: string; body: string }> {
  const result: Array<{ view: string; field: string; body: string }> = []
  const sectionHeaderRe = /^## ([a-zA-Z]+)\.([a-zA-Z]+)\s*$/m
  const lines = content.split('\n')
  let currentView = ''
  let currentField = ''
  const bodyLines: string[] = []

  for (const line of lines) {
    const match = sectionHeaderRe.exec(line)
    if (match) {
      if (currentView && currentField) {
        result.push({ view: currentView, field: currentField, body: bodyLines.join('\n').trim() })
        bodyLines.length = 0
      }
      currentView = match[1]!
      currentField = match[2]!
    } else if (currentView) {
      bodyLines.push(line)
    }
  }

  if (currentView && currentField) {
    result.push({ view: currentView, field: currentField, body: bodyLines.join('\n').trim() })
  }

  return result
}

export function parseNodeMdText(text: string): Record<string, unknown> | null {
  try {
    const { data, content } = matter(text)

    // Parse ## view.field markdown sections into views
    for (const { view, field, body } of parseMarkdownSections(content)) {
      if (!data['views']) data['views'] = {}
      const views = data['views'] as Record<string, Record<string, unknown>>
      if (!views[view]) views[view] = {}
      views[view]![field] = body
    }

    // Promote top-level view shorthand keys into views (e.g. frontmatter `dev:` key)
    for (const viewId of KNOWN_VIEW_IDS) {
      if (data[viewId]) {
        const existing = (data['views'] ?? {}) as Record<string, unknown>
        data['views'] = {
          ...existing,
          [viewId]: { ...(data[viewId] as object), ...((existing[viewId] as object) ?? {}) },
        }
        delete data[viewId]
      }
    }

    // Always ensure views is present (required by schema)
    if (!data['views']) data['views'] = {}

    return data
  } catch {
    return null
  }
}

export function readNodeMd(filePath: string): LacNode | null {
  try {
    const nodeDir = dirname(filePath)
    const data = parseNodeMdText(readFileSync(filePath, 'utf-8'))
    if (!data) return null

    if (data['views']) {
      data['views'] = resolveRefs(data['views'], nodeDir) as Record<string, unknown>
    }

    const result = LacNodeSchema.safeParse(data)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function writeNodeMd(filePath: string, node: Record<string, unknown>): void {
  const { views, ...rest } = node as {
    views?: Record<string, Record<string, unknown>>
    [k: string]: unknown
  }
  const frontmatterData: Record<string, unknown> = { ...rest }
  const sections: string[] = []

  for (const [viewId, view] of Object.entries(views ?? {})) {
    if (!view || typeof view !== 'object') continue
    const structured: Record<string, unknown> = {}
    for (const [fieldId, value] of Object.entries(view as Record<string, unknown>)) {
      if (PROSE_FIELDS.has(fieldId) && typeof value === 'string' && value.trim()) {
        sections.push(`## ${viewId}.${fieldId}\n\n${value.trim()}`)
      } else if (value !== undefined && value !== null && value !== '') {
        structured[fieldId] = value
      }
    }
    if (Object.keys(structured).length > 0) {
      frontmatterData[viewId] = structured
    }
  }

  const body = sections.length > 0 ? `\n${sections.join('\n\n')}\n` : ''
  const output = matter.stringify(body, frontmatterData)
  writeFileSync(filePath, output)
}

export function readNodeFile(filePath: string): LacNode | null {
  if (filePath.endsWith('.md')) return readNodeMd(filePath)
  try {
    const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown
    const result = LacNodeSchema.safeParse(raw)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function writeNodeFile(filePath: string, node: Record<string, unknown>): void {
  if (filePath.endsWith('.md')) {
    writeNodeMd(filePath, node)
  } else {
    writeFileSync(filePath, JSON.stringify(node, null, 2))
  }
}
