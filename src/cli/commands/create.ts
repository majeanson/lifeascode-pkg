import { existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Command } from 'commander'
import { findLacConfig } from '../../config.js'
import { writeNodeMd } from '../../parser.js'
import { generateId } from '../../utils.js'

const KNOWN_TYPES = ['feature', 'bug', 'decision', 'epic', 'research', 'runbook', 'faq', 'release']

export const createCmd = new Command('create')
  .description('Scaffold a new node.md')
  .argument('<type>', `node type (${KNOWN_TYPES.join(' | ')})`)
  .argument('<title>', 'node title')
  .option('-d, --domain <domain>', 'domain name', 'core')
  .option('--dir <dir>', 'workspace root', '.')
  .action((type: string, title: string, opts: { domain: string; dir: string }) => {
    const root = resolve(opts.dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }
    const id = generateId(type, title)
    const nodeDir = join(root, 'nodes', opts.domain, id)
    const nodePath = join(nodeDir, 'node.md')
    if (existsSync(nodePath)) {
      console.error(`Node already exists: ${nodePath}`)
      process.exit(1)
    }
    mkdirSync(nodeDir, { recursive: true })
    writeNodeMd(nodePath, {
      id,
      type,
      title,
      status: 'draft',
      domain: opts.domain,
      schemaVersion: 2,
      views: {},
    })
    console.log(`✓ Created ${nodePath}`)
    console.log(`  id: ${id}`)
    console.log(`  Next: lac fill ${id}  (or edit the file directly)`)
  })
