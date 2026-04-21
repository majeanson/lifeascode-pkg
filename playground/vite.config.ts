import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

// Serves .lac/ files (graph.json, index.json) from the workspace root.
// Run "lac build ." first (or "lac serve ." for hot-reload).
function lacStaticPlugin(): Plugin {
  return {
    name: 'lac-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith('/.lac/')) return next()
        const filePath = join(process.cwd(), url)
        if (existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(readFileSync(filePath))
        } else {
          res.statusCode = 404
          res.end(`Not found: ${url} — run "lac build ." first`)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), lacStaticPlugin()],
})
