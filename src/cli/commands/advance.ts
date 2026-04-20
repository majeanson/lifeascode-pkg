import { resolve } from 'node:path'
import { join } from 'node:path'
import { Command } from 'commander'
import { LacStatusSchema } from '../../schema.js'
import { findLacConfig, loadConfig } from '../../config.js'
import { readNodeFile, writeNodeFile } from '../../parser.js'
import { scanNodes } from '../../utils.js'
import { advanceNode } from '../../lifecycle.js'

export const advanceCmd = new Command('advance')
  .description('Advance a node to a new status (draft → active → frozen → deprecated)')
  .argument('<id>', 'node id')
  .argument('<status>', 'target status (active | frozen | deprecated)')
  .option('--dir <dir>', 'workspace root', '.')
  .option('--reason <reason>', 'reason for the transition')
  .action((id: string, status: string, opts: { dir: string; reason?: string }) => {
    const root = resolve(opts.dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }
    const config = loadConfig(configPath)

    const statusParsed = LacStatusSchema.safeParse(status)
    if (!statusParsed.success) {
      console.error(`Invalid status "${status}". Must be one of: active, frozen, deprecated`)
      process.exit(1)
    }

    // Find the node file
    const paths = scanNodes(root)
    const nodePath = paths.find((p) => p.includes(id))
    if (!nodePath) {
      console.error(`Node not found: ${id}`)
      process.exit(1)
    }

    const node = readNodeFile(nodePath)
    if (!node) {
      console.error(`Failed to parse node: ${nodePath}`)
      process.exit(1)
    }

    const result = advanceNode(node, statusParsed.data, config)
    if (!result.ok || !result.node) {
      console.error(`✗ ${result.error}`)
      process.exit(1)
    }

    const updated = result.node
    if (opts.reason) {
      const history = updated.statusHistory ?? []
      const last = history[history.length - 1]
      if (last) last.reason = opts.reason
    }

    writeNodeFile(nodePath, updated as unknown as Record<string, unknown>)
    console.log(`✓ ${node.id}: ${node.status} → ${updated.status}`)
  })
