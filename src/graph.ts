import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { LacEdge, LacGraph, LacIndex, LacNode } from './schema.js'
import { findLacConfig, loadConfig } from './config.js'
import { readNodeFile } from './parser.js'
import { scanNodes } from './utils.js'

function buildEdges(nodes: LacNode[]): LacEdge[] {
  const edges: LacEdge[] = []
  const seen = new Set<string>()
  function add(edge: LacEdge) {
    const key = `${edge.from}|${edge.to}|${edge.type}`
    if (!seen.has(key)) { seen.add(key); edges.push(edge) }
  }
  for (const node of nodes) {
    // parent → child (from parent's perspective)
    if (node.parent) add({ from: node.parent, to: node.id, type: 'child' })
    // children array → same edges (deduplicated by seen set)
    for (const id of node.children ?? []) add({ from: node.id, to: id, type: 'child' })
    for (const id of node.blockedBy ?? []) add({ from: node.id, to: id, type: 'blockedBy' })
    for (const id of node.enables ?? []) add({ from: node.id, to: id, type: 'enables' })
    for (const id of node.references ?? []) add({ from: node.id, to: id, type: 'references' })
    if (node.fixes) add({ from: node.id, to: node.fixes, type: 'fixes' })
    for (const id of node.resolvedInto ?? []) add({ from: node.id, to: id, type: 'resolvedInto' })
    if (node.supersedes) add({ from: node.id, to: node.supersedes, type: 'supersedes' })
  }
  return edges
}

export function buildGraph(dir: string): { graph: LacGraph; index: LacIndex; errors: string[] } {
  const configPath = findLacConfig(dir)
  if (!configPath) throw new Error('lac.config.json not found. Run "lac init" first.')

  const config = loadConfig(configPath)
  const nodePaths = scanNodes(dir)
  const nodes: LacNode[] = []
  const errors: string[] = []

  for (const p of nodePaths) {
    const node = readNodeFile(p)
    if (node) {
      nodes.push(node)
    } else {
      errors.push(`Invalid node: ${p}`)
    }
  }

  const edges = buildEdges(nodes)
  const domains = [...new Set(nodes.map((n) => n.domain))].sort()

  const graph: LacGraph = {
    schemaVersion: 2,
    project: config.project,
    generated: new Date().toISOString(),
    nodes,
    edges,
    meta: { counts: { nodes: nodes.length, edges: edges.length }, domains },
  }

  const index = buildIndex(graph)

  const lacDir = join(dirname(configPath), '.lac')
  mkdirSync(lacDir, { recursive: true })
  writeFileSync(join(lacDir, 'graph.json'), JSON.stringify(graph, null, 2))
  writeFileSync(join(lacDir, 'index.json'), JSON.stringify(index, null, 2))

  return { graph, index, errors }
}

export function buildIndex(graph: LacGraph): LacIndex {
  return {
    schemaVersion: 2,
    project: graph.project,
    generated: graph.generated,
    nodes: graph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      status: n.status,
      domain: n.domain,
      priority: n.priority,
      tags: n.tags,
    })),
  }
}
