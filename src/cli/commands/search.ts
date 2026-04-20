import { resolve } from 'node:path'
import { Command } from 'commander'
import { findLacConfig } from '../../config.js'
import { readNodeFile } from '../../parser.js'
import { scanNodes } from '../../utils.js'

export const searchCmd = new Command('search')
  .description('Full-text search across all nodes')
  .argument('<query>', 'search term')
  .option('--dir <dir>', 'workspace root', '.')
  .option('--type <type>', 'filter by node type')
  .option('--domain <domain>', 'filter by domain')
  .option('--status <status>', 'filter by status')
  .action((query: string, opts: { dir: string; type?: string; domain?: string; status?: string }) => {
    const root = resolve(opts.dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }

    const paths = scanNodes(root)
    const q = query.toLowerCase()
    const matches: string[] = []

    for (const p of paths) {
      const node = readNodeFile(p)
      if (!node) continue
      if (opts.type && node.type !== opts.type) continue
      if (opts.domain && node.domain !== opts.domain) continue
      if (opts.status && node.status !== opts.status) continue

      const haystack = JSON.stringify(node).toLowerCase()
      if (haystack.includes(q)) {
        matches.push(`[${node.status}] ${node.type}/${node.id} — ${node.title}`)
      }
    }

    if (matches.length === 0) {
      console.log(`No results for "${query}"`)
    } else {
      console.log(`${matches.length} result(s) for "${query}":\n`)
      for (const m of matches) console.log(`  ${m}`)
    }
  })
