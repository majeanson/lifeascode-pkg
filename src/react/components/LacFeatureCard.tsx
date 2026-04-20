import React, { useState, useEffect, useRef } from 'react'
import type { LacNode } from '../../schema.js'
import type { LacTheme } from '../theme.js'
import { statusBg, statusColor, typeLabel } from '../utils.js'
import { MarkdownField } from './MarkdownField.js'

const FILE_PATH_RE = /^(packages|apps|src|libs|dist)\/[\w\-./@]+\.(tsx?|jsx?|json|css|scss|md|html|mjs|cjs)$/
const ARROW_ITEM_RE = /^(.+?)\s+→\s+(.+)$/

export interface LacFeatureCardProps {
  node: LacNode
  theme: LacTheme
  defaultView?: string
  onClose?: () => void
  style?: React.CSSProperties
  nodeIndex?: Map<string, LacNode>
  onNodeRequest?: (id: string) => void
  onFileOpen?: (path: string) => void
  onSave?: (id: string, domain: string, fields: Record<string, unknown>) => Promise<void>
}

const VIEW_TABS = ['dev', 'product', 'user', 'support', 'tester']
const VIEW_LABELS: Record<string, string> = { dev: 'Dev', product: 'Product', user: 'Guide', support: 'Ops', tester: 'Tests' }
const TYPE_ICONS: Record<string, string> = { epic: '⬡', feature: '◆', decision: '⊙', research: '△', release: '★', runbook: '▶', faq: '◇', bug: '⚠' }
const FIELD_LABELS: Record<string, string> = {
  implementation: 'Implementation', componentFile: 'Component File', codeSnippets: 'Code Snippets',
  edgeCases: 'Edge Cases', choice: 'Choice', rationale: 'Rationale',
  problem: 'Problem', successCriteria: 'Success Criteria', acceptanceCriteria: 'Acceptance Criteria',
  metrics: 'Metrics', milestones: 'Milestones', impact: 'Impact',
  userGuide: 'User Guide', knownLimitations: 'Known Limitations', workarounds: 'Workarounds',
  releaseNotes: 'Release Notes', faq: 'FAQ', supportNotes: 'Support Notes',
  escalationPath: 'Escalation', steps: 'Steps', rollback: 'Rollback',
  testCases: 'Test Cases', expectedBehavior: 'Expected Behavior',
  npmPackages: 'npm Packages', publicInterface: 'Public Interface', testStrategy: 'Test Strategy',
}
const RELATION_GROUPS: Array<{ key: keyof LacNode; label: string; multi: boolean }> = [
  { key: 'parent', label: 'Parent', multi: false },
  { key: 'children', label: 'Children', multi: true },
  { key: 'references', label: 'References', multi: true },
  { key: 'enables', label: 'Enables', multi: true },
  { key: 'blockedBy', label: 'Blocked by', multi: true },
  { key: 'fixes', label: 'Fixes', multi: false },
  { key: 'supersedes', label: 'Supersedes', multi: false },
  { key: 'supersededBy', label: 'Superseded by', multi: false },
]

function AutoTextarea({ value, onChange, theme: t }: { value: string; onChange: (v: string) => void; theme: LacTheme }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) { ref.current.style.height = 'auto'; ref.current.style.height = `${ref.current.scrollHeight}px` }
  }, [value])
  return <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} rows={3} style={{ width: '100%', fontFamily: t.fontMono, fontSize: '12px', color: t.text, background: t.bg, border: `1px solid ${t.accent}`, borderRadius: '4px', padding: '8px', resize: 'none', outline: 'none', lineHeight: '1.5', overflow: 'hidden', boxSizing: 'border-box' }} />
}

function ArrayItem({ item, theme: t, onFileOpen }: { item: string; theme: LacTheme; onFileOpen?: (path: string) => void }) {
  const arrowMatch = ARROW_ITEM_RE.exec(item)
  if (arrowMatch) {
    const [, label, path] = arrowMatch
    const trimmedPath = path!.trim()
    const isFile = FILE_PATH_RE.test(trimmedPath)
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: '13px' }}>
        <span style={{ color: t.text, fontWeight: 500, minWidth: '120px', flexShrink: 0 }}>{label}</span>
        {isFile && onFileOpen ? (
          <button onClick={() => onFileOpen(trimmedPath)} style={{ color: t.accent, fontSize: '12px', fontFamily: t.fontMono, textDecoration: 'underline', textDecorationStyle: 'dotted', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{trimmedPath}</button>
        ) : (
          <span style={{ color: t.textMuted, fontFamily: t.fontMono, fontSize: '12px' }}>{trimmedPath}</span>
        )}
      </div>
    )
  }
  if (FILE_PATH_RE.test(item) && onFileOpen) {
    return <button onClick={() => onFileOpen(item)} style={{ display: 'block', color: t.accent, fontSize: '12px', fontFamily: t.fontMono, textDecoration: 'underline', textDecorationStyle: 'dotted', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{item}</button>
  }
  return <div style={{ display: 'flex', gap: '6px', fontSize: '13px' }}><span style={{ color: t.textMuted, flexShrink: 0 }}>•</span><span style={{ color: t.text }}>{item}</span></div>
}

export function LacFeatureCard({ node, theme: t, defaultView = 'dev', onClose, style, nodeIndex, onNodeRequest, onFileOpen, onSave }: LacFeatureCardProps) {
  const availableViews = VIEW_TABS.filter((v) => node.views[v] && Object.keys(node.views[v]!).length > 0)
  const [activeView, setActiveView] = useState(defaultView)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  useEffect(() => { setEditMode(false); setSaveError(null) }, [activeView, node.id])

  const viewData = (node.views[activeView] ?? {}) as Record<string, unknown>

  function enterEdit() {
    const initial: Record<string, string> = {}
    for (const [k, v] of Object.entries(viewData)) initial[k] = Array.isArray(v) ? (v as string[]).join('\n') : String(v ?? '')
    setEditValues(initial)
    setEditMode(true)
    setSaveError(null)
  }

  async function handleSave() {
    if (!onSave) return
    setSaving(true)
    setSaveError(null)
    const fields: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(editValues)) {
      // Restore array fields: if the original value was an array, split back on newlines
      const original = viewData[k]
      fields[`views.${activeView}.${k}`] = Array.isArray(original)
        ? v.split('\n').map((s) => s.trim()).filter(Boolean)
        : v
    }
    try { await onSave(node.id, node.domain, fields); setEditMode(false) }
    catch (e) { setSaveError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const relGroups = RELATION_GROUPS.flatMap(({ key, label, multi }) => {
    const val = node[key]
    if (!val) return []
    const ids: string[] = multi ? (val as string[]) : [val as string]
    return ids.length === 0 ? [] : [{ label, ids }]
  })

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.borderRadius, overflow: 'hidden', ...style }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ background: statusBg(node.status, t), color: statusColor(node.status, t), padding: '2px 6px', borderRadius: t.borderRadiusSm, fontSize: '11px' }}>{node.status}</span>
        <span style={{ color: t.textMuted, fontSize: '12px' }}>{typeLabel(node.type)}</span>
        <span style={{ flex: 1, color: t.text, fontWeight: 700, fontSize: '16px', minWidth: '120px' }}>{TYPE_ICONS[node.type] ?? '○'} {node.title}</span>
        <span style={{ fontSize: '10px', color: t.textMuted, background: 'rgba(128,128,128,0.1)', borderRadius: '10px', padding: '1px 7px' }}>{node.domain}</span>
        {node.priority && <span style={{ fontSize: '10px', color: t.accent, background: t.accentBg, borderRadius: '10px', padding: '1px 7px' }}>P{node.priority}</span>}
        {onSave && !editMode && <button onClick={enterEdit} style={{ padding: '3px 10px', fontSize: '11px', borderRadius: t.borderRadiusSm, border: `1px solid ${t.border}`, background: 'transparent', color: t.textMuted, cursor: 'pointer', fontFamily: t.fontFamily }}>Edit</button>}
        {editMode && <>
          <button onClick={handleSave} disabled={saving} style={{ padding: '3px 10px', fontSize: '11px', borderRadius: t.borderRadiusSm, border: 'none', background: t.accent, color: '#fff', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '…' : 'Save'}</button>
          <button onClick={() => setEditMode(false)} disabled={saving} style={{ padding: '3px 10px', fontSize: '11px', borderRadius: t.borderRadiusSm, border: `1px solid ${t.border}`, background: 'transparent', color: t.textMuted, cursor: 'pointer' }}>Cancel</button>
        </>}
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}>×</button>}
      </div>

      {/* View tabs */}
      {availableViews.length > 1 && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, background: t.bg }}>
          {availableViews.map((v) => (
            <button key={v} onClick={() => setActiveView(v)} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeView === v ? `2px solid ${t.accent}` : '2px solid transparent', color: activeView === v ? t.accent : t.textMuted, cursor: 'pointer', fontFamily: t.fontFamily, fontSize: '13px', fontWeight: activeView === v ? 600 : 400 }}>
              {VIEW_LABELS[v] ?? v}
            </button>
          ))}
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{saveError}</span>
          <button onClick={() => setSaveError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>×</button>
        </div>
      )}

      {/* Fields */}
      <div style={{ padding: '16px' }}>
        {Object.entries(viewData).map(([key, val]) =>
          val != null && val !== '' ? (
            <div key={key} style={{ marginBottom: '14px' }}>
              <div style={{ color: t.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '7px' }}>
                {FIELD_LABELS[key] ?? key}
              </div>
              {editMode ? (
                <AutoTextarea value={editValues[key] ?? ''} onChange={(v) => setEditValues((p) => ({ ...p, [key]: v }))} theme={t} />
              ) : Array.isArray(val) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {(val as string[]).map((item, idx) => <ArrayItem key={idx} item={String(item)} theme={t} onFileOpen={onFileOpen} />)}
                </div>
              ) : typeof val === 'string' && FILE_PATH_RE.test(val) && onFileOpen ? (
                <button onClick={() => onFileOpen(val)} style={{ color: t.accent, fontSize: '13px', textDecoration: 'underline', textDecorationStyle: 'dotted', fontFamily: t.fontMono, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{val}</button>
              ) : typeof val === 'string' && (val.includes('\n') || val.includes('**') || val.includes('`') || val.match(/^[-*]\s/m)) ? (
                <MarkdownField content={val} theme={t} onFileOpen={onFileOpen} />
              ) : (
                <div style={{ color: t.text, fontSize: '14px', lineHeight: '1.6' }}>{String(val)}</div>
              )}
            </div>
          ) : null
        )}
        {Object.keys(viewData).length === 0 && <div style={{ color: t.textMuted, fontSize: '13px' }}>No content in this view yet.</div>}
      </div>

      {/* Related nodes */}
      {!editMode && relGroups.length > 0 && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Related</div>
          {relGroups.map(({ label, ids }) => (
            <div key={label} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: t.textMuted, minWidth: '80px' }}>{label}</span>
              {ids.map((id) => {
                const linked = nodeIndex?.get(id)
                const icon = TYPE_ICONS[linked?.type ?? ''] ?? '○'
                const title = linked?.title ?? id.replace(/-[a-z0-9]{4,}$/, '').replace(/^[a-z]+-/, '').replace(/-/g, ' ')
                return (
                  <button key={id} onClick={() => onNodeRequest?.(id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', fontSize: '13px', borderRadius: '12px', border: `1px solid ${t.border}`, background: t.bg, color: onNodeRequest ? t.accent : t.text, cursor: onNodeRequest ? 'pointer' : 'default', fontFamily: t.fontFamily }}>
                    <span style={{ fontSize: '11px' }}>{icon}</span>
                    {title}
                    {linked && <span style={{ fontSize: '10px', color: t.textMuted, background: 'rgba(128,128,128,0.12)', borderRadius: '8px', padding: '0 5px' }}>{linked.domain}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
