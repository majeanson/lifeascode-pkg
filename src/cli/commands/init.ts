import { existsSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { Command } from 'commander'

export const initCmd = new Command('init')
  .description('Initialise a Life-as-Code workspace (creates lac.config.json)')
  .argument('[dir]', 'target directory', '.')
  .action((dir: string) => {
    const target = resolve(dir)
    const configPath = join(target, 'lac.config.json')
    if (existsSync(configPath)) {
      console.error('lac.config.json already exists')
      process.exit(1)
    }
    const project = basename(target).replace(/[^a-z0-9]/gi, '').toLowerCase() || 'project'
    const config = {
      schemaVersion: 2,
      project,
      extends: ['@lifeascode'],
      types: {},
      views: {},
      index: {
        summaryFields: ['id', 'type', 'title', 'status', 'domain', 'priority', 'tags'],
        searchFields: [
          'title',
          'domain',
          'tags',
          'views.user.userGuide',
          'views.dev.implementation',
          'views.product.problem',
          'views.product.successCriteria',
        ],
      },
      hub: { defaultView: 'user', defaultTab: 'browse', accentColor: '#c4a255' },
    }
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`✓ Created lac.config.json  (project: "${project}")`)
    console.log(`  Next: lac create feature "My first feature" --domain core`)
  })
