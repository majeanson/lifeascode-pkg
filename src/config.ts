import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { LacConfigSchema, type LacConfig, type TypeDef, type ViewDef } from './schema.js'

// Built-in node type definitions (bundled with the package)
import featureDef from './node-types/feature.json'
import bugDef from './node-types/bug.json'
import decisionDef from './node-types/decision.json'
import epicDef from './node-types/epic.json'
import researchDef from './node-types/research.json'
import runbookDef from './node-types/runbook.json'
import faqDef from './node-types/faq.json'
import releaseDef from './node-types/release.json'

// Built-in view definitions (bundled with the package)
import devView from './views/dev.json'
import productView from './views/product.json'
import userView from './views/user.json'
import supportView from './views/support.json'
import testerView from './views/tester.json'

const BUILTIN_TYPES: Record<string, TypeDef> = {
  feature: featureDef as TypeDef,
  bug: bugDef as TypeDef,
  decision: decisionDef as TypeDef,
  epic: epicDef as TypeDef,
  research: researchDef as TypeDef,
  runbook: runbookDef as TypeDef,
  faq: faqDef as TypeDef,
  release: releaseDef as TypeDef,
}

const BUILTIN_VIEWS: Record<string, ViewDef> = {
  dev: devView as unknown as ViewDef,
  product: productView as unknown as ViewDef,
  user: userView as unknown as ViewDef,
  support: supportView as unknown as ViewDef,
  tester: testerView as unknown as ViewDef,
}

export function findLacConfig(startDir: string): string | null {
  let current = resolve(startDir)
  while (true) {
    const candidate = join(current, 'lac.config.json')
    if (existsSync(candidate)) return candidate
    const parent = dirname(current)
    if (parent === current) return null
    current = parent
  }
}

export function loadConfig(configPath: string): LacConfig {
  const raw = JSON.parse(readFileSync(configPath, 'utf-8')) as unknown
  const parsed = LacConfigSchema.parse(raw)

  return {
    ...parsed,
    types: { ...BUILTIN_TYPES, ...parsed.types },
    views: { ...BUILTIN_VIEWS, ...parsed.views },
  }
}

export function loadConfigOrDefault(dir: string): LacConfig {
  const configPath = findLacConfig(dir)
  if (configPath) return loadConfig(configPath)
  return {
    schemaVersion: 2,
    project: 'unknown',
    types: { ...BUILTIN_TYPES },
    views: { ...BUILTIN_VIEWS },
  }
}
