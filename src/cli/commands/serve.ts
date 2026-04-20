import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { readFileSync, existsSync, watch } from 'node:fs'
import { join, resolve, extname } from 'node:path'
import { Command } from 'commander'
import { findLacConfig } from '../../config.js'
import { buildGraph } from '../../graph.js'

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.css':  'text/css',
  '.ico':  'image/x-icon',
}

function hubHtml(dataUrl: string, hubJsUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>lac serve</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #lac-root { height: 100%; }
    body { background: #0f0f0f; }
  </style>
</head>
<body>
  <div id="lac-root"></div>
  <script>window.__LAC_DATA_URL__ = ${JSON.stringify(dataUrl)}</script>
  <script src="${hubJsUrl}"></script>
  <script>
    // SSE hot-reload
    const evs = new EventSource('/_sse')
    evs.onmessage = () => location.reload()
  </script>
</body>
</html>`
}

export const serveCmd = new Command('serve')
  .description('Live hub at http://localhost:<port> — rebuilds on node file changes')
  .argument('[dir]', 'workspace root', '.')
  .option('-p, --port <port>', 'port to listen on', '3737')
  .action((dir: string, opts: { port: string }) => {
    const root = resolve(dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }

    const port = parseInt(opts.port, 10)
    const hubJsPath = join(__dirname, '../hub.js')
    if (!existsSync(hubJsPath)) {
      console.error('Hub bundle not found. Run "lac build" (or npm install @lifeascode) to generate dist/hub.js.')
      process.exit(1)
    }

    // Initial build
    console.log('Building graph…')
    try { buildGraph(root) } catch (e) { console.error(`Build error: ${(e as Error).message}`) }

    // SSE clients
    const clients = new Set<ServerResponse>()

    function broadcast() {
      for (const res of clients) {
        res.write('data: reload\n\n')
      }
    }

    // File watcher — debounce 300ms
    const nodesDir = join(root, 'nodes')
    if (existsSync(nodesDir)) {
      let debounce: ReturnType<typeof setTimeout> | null = null
      watch(nodesDir, { recursive: true }, (_event, filename) => {
        if (!filename?.endsWith('.md') && !filename?.endsWith('.json')) return
        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(() => {
          console.log(`  changed: ${filename} — rebuilding…`)
          try {
            buildGraph(root)
            broadcast()
          } catch (e) {
            console.error(`Build error: ${(e as Error).message}`)
          }
        }, 300)
      })
    }

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = req.url ?? '/'

      // SSE endpoint
      if (url === '/_sse') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        })
        res.write(':\n\n') // comment keeps connection alive
        clients.add(res)
        req.on('close', () => clients.delete(res))
        return
      }

      // Serve hub bundle
      if (url === '/_hub.js' || url === '/_hub.js/') {
        res.writeHead(200, { 'Content-Type': 'application/javascript' })
        res.end(readFileSync(hubJsPath))
        return
      }

      // Serve .lac/graph.json and .lac/index.json
      if (url.startsWith('/.lac/')) {
        const filePath = join(root, url.slice(1))
        if (existsSync(filePath)) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(readFileSync(filePath))
          return
        }
      }

      // Everything else → hub HTML
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(hubHtml('/.lac/graph.json', '/_hub.js'))
    })

    server.listen(port, () => {
      console.log(`\n  lac serve  →  http://localhost:${port}\n`)
      console.log('  Watching nodes/ for changes…')
      console.log('  Press Ctrl+C to stop.\n')
    })
  })
