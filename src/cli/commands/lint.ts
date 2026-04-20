import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { LacNodeSchema } from '../../schema.js'
import { findLacConfig, loadConfig } from '../../config.js'
import { readNodeFile } from '../../parser.js'
import { scanNodes } from '../../utils.js'
import { validateNode } from '../../lifecycle.js'

export const lintCmd = new Command('lint')
  .description('Report validation errors and warnings across all nodes')
  .argument('[dir]', 'workspace root', '.')
  .option('--errors-only', 'suppress warnings, show errors only')
  .action((dir: string, opts: { errorsOnly?: boolean }) => {
    const root = resolve(dir)
    const configPath = findLacConfig(root)
    if (!configPath) {
      console.error('lac.config.json not found. Run "lac init" first.')
      process.exit(1)
    }
    const config = loadConfig(configPath)
    const paths = scanNodes(root)
    let errCount = 0
    let warnCount = 0

    for (const p of paths) {
      const node = readNodeFile(p)
      if (!node) {
        // Attempt detailed Zod error for JSON files
        if (p.endsWith('.json')) {
          try {
            const raw = JSON.parse(readFileSync(p, 'utf-8')) as unknown
            const result = LacNodeSchema.safeParse(raw)
            if (!result.success) {
              errCount++
              console.error(`✗ ${p}`)
              for (const issue of result.error.issues) {
                console.error(`    ${issue.path.join('.')}: ${issue.message}`)
              }
              continue
            }
          } catch {
            // fall through to generic error
          }
        }
        errCount++
        console.error(`✗ ${p}: failed to parse`)
        continue
      }

      const issues = validateNode(node, config)
      const errors = issues.filter((i) => i.level === 'error')
      const warns = issues.filter((i) => i.level === 'warn')

      if (errors.length > 0) {
        errCount += errors.length
        console.error(`✗ [${node.status}] ${node.type}/${node.id} — ${node.title}`)
        for (const e of errors) console.error(`    error: ${e.message}`)
      }
      if (!opts.errorsOnly && warns.length > 0) {
        warnCount += warns.length
        console.warn(`  ⚠ [${node.status}] ${node.type}/${node.id} — ${node.title}`)
        for (const w of warns) console.warn(`    warn: ${w.message}`)
      }
    }

    if (errCount === 0 && warnCount === 0) {
      console.log(`✓ ${paths.length} node(s) — clean`)
    } else {
      if (errCount > 0) console.error(`\n${errCount} error(s)`)
      if (!opts.errorsOnly && warnCount > 0) console.warn(`${warnCount} warning(s)`)
      if (errCount > 0) process.exit(1)
    }
  })
