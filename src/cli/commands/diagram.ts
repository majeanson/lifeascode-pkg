import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Command } from 'commander'
import { findLacConfig } from '../../config.js'
import type { LacGraph } from '../../schema.js'

const TYPE_SHAPE: Record<string, [string, string]> = {
  epic:     ['[/', '/]'],
  feature:  ['[', ']'],
  decision: ['{{', '}}'],
  bug:      ['[/', '/]'],
  research: ['(', ')'],
  runbook:  ['[', ']'],
  faq:      ['(', ')'],
  release:  ['[\\', '/]'],
}

function nodeShape(type: string, label: string): string {
  const [open, close] = TYPE_SHAPE[type] ?? ['[', ']']
  return `${open}"${label}"${close}`
}

function sanitize(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_')
}

export const diagramCmd = new Command('diagram')
  .description('Print a Mermaid flowchart of the node graph')
  .argument('[dir]', 'workspace root', '.')
  .option('--direction <dir>', 'graph direction (LR | TD)', 'LR')
  .option('--type <type>', 'filter by node type')
  .option('--domain <domain>', 'filter by domain')
  .action((dir: string, opts: { direction: string; type?: string; domain?: string }) => {
    const root = resolve(dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }

    const graphPath = join(root, '.lac', 'graph.json')
    if (!existsSync(graphPath)) {
      console.error('.lac/graph.json not found. Run "lac build" first.')
      process.exit(1)
    }

    const graph = JSON.parse(readFileSync(graphPath, 'utf-8')) as LacGraph

    let nodes = graph.nodes
    if (opts.type) nodes = nodes.filter((n) => n.type === opts.type)
    if (opts.domain) nodes = nodes.filter((n) => n.domain === opts.domain)
    const nodeIds = new Set(nodes.map((n) => n.id))

    const lines: string[] = [`flowchart ${opts.direction}`]

    // Node definitions
    for (const node of nodes) {
      const id = sanitize(node.id)
      const label = node.title.replace(/"/g, "'")
      lines.push(`  ${id}${nodeShape(node.type, label)}`)
    }

    // Edges (only between visible nodes)
    const edgeStyles: Record<string, string> = {
      child: '-->',
      parent: '-->',
      enables: '-.->',
      blockedBy: '--x',
      references: '-.-',
      fixes: '==>',
      supersedes: '--o',
    }
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) continue
      if (edge.type === 'parent') continue // skip reverse; child edges cover this
      const arrow = edgeStyles[edge.type] ?? '-->'
      lines.push(`  ${sanitize(edge.from)} ${arrow} ${sanitize(edge.to)}`)
    }

    // Status colour classes
    lines.push('')
    lines.push('  classDef draft fill:#1a1a1a,stroke:#555,color:#888')
    lines.push('  classDef active fill:#1a2a1a,stroke:#c4a255,color:#e0e0e0')
    lines.push('  classDef frozen fill:#0d1a2a,stroke:#4a9eff,color:#e0e0e0')
    lines.push('  classDef deprecated fill:#1a1a1a,stroke:#444,color:#555')

    for (const node of nodes) {
      lines.push(`  class ${sanitize(node.id)} ${node.status}`)
    }

    console.log(lines.join('\n'))
  })
