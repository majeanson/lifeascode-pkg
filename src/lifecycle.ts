import type { LacConfig, LacNode, LacStatus } from './schema.js'
import { getNestedValue, isEmpty } from './utils.js'

export interface AdvanceResult {
  ok: boolean
  error?: string
  node?: LacNode
}

export function advanceNode(node: LacNode, toStatus: LacStatus, config: LacConfig): AdvanceResult {
  const typeDef = config.types[node.type]
  if (!typeDef) return { ok: false, error: `Unknown node type "${node.type}"` }

  const allowed = typeDef.statusTransitions?.[node.status] ?? []
  if (!allowed.includes(toStatus)) {
    return {
      ok: false,
      error: `Cannot advance ${node.type} from "${node.status}" to "${toStatus}". Allowed: [${allowed.join(', ') || 'none'}]`,
    }
  }

  if (toStatus === 'frozen') {
    for (const viewId of typeDef.requiredViews ?? []) {
      if (isEmpty(getNestedValue(node, `views.${viewId}`))) {
        return { ok: false, error: `Cannot freeze: missing required view "${viewId}"` }
      }
    }
    if (typeDef.class === 'absorbing') {
      if (!node.fixes) {
        return { ok: false, error: 'Cannot freeze: absorbing node (bug) must have "fixes" set' }
      }
      if (!node.resolvedInto?.length) {
        return { ok: false, error: 'Cannot freeze: absorbing node (bug) must have "resolvedInto" populated' }
      }
    }
  }

  const updated: LacNode = {
    ...node,
    status: toStatus,
    statusHistory: [
      ...(node.statusHistory ?? []),
      { from: node.status, to: toStatus, date: new Date().toISOString() },
    ],
  }

  return { ok: true, node: updated }
}

export function validateNode(
  node: LacNode,
  config: LacConfig
): Array<{ level: 'error' | 'warn'; message: string }> {
  const issues: Array<{ level: 'error' | 'warn'; message: string }> = []
  const typeDef = config.types[node.type]

  if (!typeDef) {
    issues.push({ level: 'error', message: `Unknown type "${node.type}"` })
    return issues
  }

  if (node.status === 'frozen') {
    for (const viewId of typeDef.requiredViews ?? []) {
      if (isEmpty(getNestedValue(node, `views.${viewId}`))) {
        issues.push({ level: 'warn', message: `Frozen node missing required view "${viewId}"` })
      }
    }
    if (typeDef.class === 'absorbing' && !node.fixes) {
      issues.push({ level: 'error', message: 'Absorbing node (bug) must have "fixes" set' })
    }
  }

  if (node.status === 'active' || node.status === 'frozen') {
    for (const viewId of typeDef.requiredViews ?? []) {
      if (isEmpty(getNestedValue(node, `views.${viewId}`))) {
        issues.push({ level: 'warn', message: `Active node missing view "${viewId}" — will block freeze` })
      }
    }
  }

  return issues
}
