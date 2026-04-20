import React from 'react'
import type { LacTheme } from '../theme.js'

interface Props {
  content: string
  theme: LacTheme
  onFileOpen?: (path: string) => void
}

const FILE_PATH_RE = /^(packages|apps|src|libs|dist)\/[\w\-./@]+\.(tsx?|jsx?|json|css|scss|md|html|mjs|cjs)$/
const ARROW_ITEM_RE = /^(.+?)\s+→\s+(.+)$/

function parseInline(text: string, theme: LacTheme, onFileOpen?: (path: string) => void): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const token = m[0]!
    if (token.startsWith('`')) {
      const inner = token.slice(1, -1)
      if (onFileOpen && FILE_PATH_RE.test(inner)) {
        parts.push(
          <button key={m.index} onClick={() => onFileOpen(inner)} style={{ fontFamily: theme.fontMono, background: 'rgba(128,128,128,0.15)', padding: '1px 4px', borderRadius: '3px', fontSize: '12px', color: theme.accent, border: 'none', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
            {inner}
          </button>
        )
      } else {
        parts.push(<code key={m.index} style={{ fontFamily: theme.fontMono, background: 'rgba(128,128,128,0.15)', padding: '1px 4px', borderRadius: '3px', fontSize: '12px' }}>{inner}</code>)
      }
    } else {
      parts.push(<strong key={m.index}>{token.slice(2, -2)}</strong>)
    }
    last = m.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export function MarkdownField({ content, theme, onFileOpen }: Props) {
  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!

    if (line.trimStart().startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i]!.trimStart().startsWith('```')) { codeLines.push(lines[i]!); i++ }
      nodes.push(<pre key={i} style={{ fontFamily: theme.fontMono, background: 'rgba(128,128,128,0.1)', border: '1px solid rgba(128,128,128,0.2)', borderRadius: '4px', padding: '10px 12px', fontSize: '12px', overflowX: 'auto', margin: '6px 0', whiteSpace: 'pre' }}><code>{codeLines.join('\n')}</code></pre>)
      i++
      continue
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1]!.length
      const sizes = ['16px', '14px', '13px']
      nodes.push(<div key={i} style={{ fontWeight: 700, fontSize: sizes[level - 1] ?? '13px', color: theme.text, marginTop: level === 1 ? '12px' : '8px', marginBottom: '4px' }}>{parseInline(headingMatch[2]!, theme, onFileOpen)}</div>)
      i++
      continue
    }

    if (line.match(/^[-*]\s+/)) {
      const items: string[] = []
      while (i < lines.length && lines[i]!.match(/^[-*]\s+/)) { items.push(lines[i]!.replace(/^[-*]\s+/, '')); i++ }
      nodes.push(<ul key={i} style={{ margin: '4px 0', paddingLeft: '16px' }}>{items.map((item, idx) => <li key={idx} style={{ color: theme.text, fontSize: '13px', marginBottom: '2px', listStyleType: 'disc' }}>{parseInline(item, theme, onFileOpen)}</li>)}</ul>)
      continue
    }

    if (line.trim() === '') { i++; continue }

    nodes.push(<p key={i} style={{ color: theme.text, fontSize: '13px', margin: '2px 0 6px 0', lineHeight: '1.5' }}>{parseInline(line, theme, onFileOpen)}</p>)
    i++
  }

  return <div>{nodes}</div>
}
