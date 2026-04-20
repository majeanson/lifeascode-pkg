import { resolve } from 'node:path'
import { Command } from 'commander'
import { findLacConfig, loadConfig } from '../../config.js'
import { readNodeFile } from '../../parser.js'
import { scanNodes } from '../../utils.js'

export const statusCmd = new Command('status')
  .description('Show workspace health summary')
  .argument('[dir]', 'workspace root', '.')
  .option('--domain <domain>', 'filter by domain')
  .action((dir: string, opts: { domain?: string }) => {
    const root = resolve(dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }
    const config = loadConfig(configPath)
    const paths = scanNodes(root)
    const counts = { draft: 0, active: 0, frozen: 0, deprecated: 0, invalid: 0 }
    const blocked: string[] = []
    const typeCount: Record<string, number> = {}

    for (const p of paths) {
      const node = readNodeFile(p)
      if (!node) { counts.invalid++; continue }
      if (opts.domain && node.domain !== opts.domain) continue
      counts[node.status]++
      typeCount[node.type] = (typeCount[node.type] ?? 0) + 1
      if (node.blockedBy?.length) blocked.push(`${node.id} (blocked by: ${node.blockedBy.join(', ')})`)
    }

    const total = counts.draft + counts.active + counts.frozen + counts.deprecated
    console.log(`\nProject: ${config.project}`)
    console.log(`Nodes:   ${total} total${opts.domain ? ` (domain: ${opts.domain})` : ''}`)
    console.log(`  draft      ${counts.draft}`)
    console.log(`  active     ${counts.active}`)
    console.log(`  frozen     ${counts.frozen}`)
    console.log(`  deprecated ${counts.deprecated}`)
    if (counts.invalid > 0) console.warn(`  invalid    ${counts.invalid}`)

    const types = Object.entries(typeCount).sort((a, b) => b[1] - a[1])
    if (types.length > 0) {
      console.log(`\nBy type:`)
      for (const [t, n] of types) console.log(`  ${t.padEnd(12)} ${n}`)
    }

    if (blocked.length > 0) {
      console.log(`\nBlocked (${blocked.length}):`)
      for (const b of blocked) console.log(`  ${b}`)
    }
    console.log()
  })
