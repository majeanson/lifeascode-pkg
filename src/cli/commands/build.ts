import { resolve } from 'node:path'
import { Command } from 'commander'
import { buildGraph } from '../../graph.js'

export const buildCmd = new Command('build')
  .description('Validate all nodes and emit .lac/graph.json + .lac/index.json')
  .argument('[dir]', 'workspace root', '.')
  .action((dir: string) => {
    const root = resolve(dir)
    try {
      const { graph, errors } = buildGraph(root)
      if (errors.length > 0) {
        console.warn(`\n⚠ ${errors.length} invalid node(s) skipped:`)
        for (const e of errors) console.warn(`  ${e}`)
      }
      console.log(`✓ Built graph — ${graph.meta.counts.nodes} nodes, ${graph.meta.counts.edges} edges`)
      console.log(`  Domains: ${graph.meta.domains.join(', ') || '(none)'}`)
      console.log(`  Output: .lac/graph.json, .lac/index.json`)
    } catch (err) {
      console.error((err as Error).message)
      process.exit(1)
    }
  })
