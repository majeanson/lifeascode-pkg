import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Command } from 'commander'
import { findLacConfig } from '../../config.js'
import { buildGraph } from '../../graph.js'

function exportHtml(graphJson: string, hubJsSource: string, title: string): string {
  const escaped = graphJson.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #lac-root { height: 100%; }
    body { background: #0f0f0f; }
  </style>
</head>
<body>
  <div id="lac-root"></div>
  <script>window.__LAC_GRAPH__ = ${escaped}</script>
  <script>${hubJsSource}</script>
</body>
</html>`
}

export const exportCmd = new Command('export')
  .description('Export the graph as a self-contained HTML file (lac export --html) or JSON (lac export --json)')
  .argument('[dir]', 'workspace root', '.')
  .option('--html', 'export as a self-contained HTML file (.lac/hub.html)')
  .option('--json', 'export graph as .lac/graph.json (runs build)')
  .option('-o, --out <path>', 'output path override')
  .option('--no-build', 'skip running lac build (use existing .lac/graph.json)')
  .action((dir: string, opts: { html?: boolean; json?: boolean; out?: string; build: boolean }) => {
    const root = resolve(dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }

    if (!opts.html && !opts.json) {
      console.error('Specify --html or --json (or both).')
      process.exit(1)
    }

    // Run build unless skipped
    if (opts.build !== false) {
      console.log('Building graph…')
      try {
        buildGraph(root)
      } catch (e) {
        console.error(`Build error: ${(e as Error).message}`)
        process.exit(1)
      }
    }

    const graphPath = join(root, '.lac', 'graph.json')
    if (!existsSync(graphPath)) {
      console.error('.lac/graph.json not found. Run "lac build" first or remove --no-build.')
      process.exit(1)
    }

    const graphJson = readFileSync(graphPath, 'utf8')

    if (opts.json) {
      const outPath = opts.out ?? graphPath
      writeFileSync(outPath, graphJson, 'utf8')
      console.log(`  graph.json → ${outPath}`)
    }

    if (opts.html) {
      const hubJsPath = join(__dirname, '../hub.js')
      if (!existsSync(hubJsPath)) {
        console.error('Hub bundle not found at dist/hub.js. Run "bun run build" first.')
        process.exit(1)
      }

      const hubJsSource = readFileSync(hubJsPath, 'utf8')

      // Title from graph meta or fallback
      let title = 'LAC Hub'
      try {
        const graph = JSON.parse(graphJson) as { meta?: { project?: string } }
        if (graph.meta?.project) title = `${graph.meta.project} — LAC Hub`
      } catch { /* ignore */ }

      const html = exportHtml(graphJson, hubJsSource, title)
      const outPath = opts.out ?? join(root, '.lac', 'hub.html')
      writeFileSync(outPath, html, 'utf8')
      console.log(`  hub.html  → ${outPath}`)
    }
  })
