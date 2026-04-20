import React from 'react'
import { createRoot } from 'react-dom/client'
import { LacHub } from './components/LacHub.js'

declare global {
  interface Window {
    __LAC_DATA_URL__?: string
    __LAC_GRAPH__?: unknown
  }
}

function mount() {
  const el = document.getElementById('lac-root')
  if (!el) return
  const props: Record<string, unknown> = { theme: 'dark', fullscreen: true }
  if (window.__LAC_GRAPH__) {
    props.data = window.__LAC_GRAPH__
  } else {
    props.dataUrl = window.__LAC_DATA_URL__ ?? '/.lac/graph.json'
  }
  createRoot(el).render(React.createElement(LacHub, props as never))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
