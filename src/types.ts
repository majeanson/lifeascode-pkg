// Re-export all types from schema (single source of truth via Zod inference)
export type {
  LacStatus,
  LacStatusTransition,
  LacAnnotation,
  LacFieldLock,
  LacNode,
  LacEdge,
  LacGraph,
  LacIndexEntry,
  LacIndex,
  LacConfig,
  TypeDef,
  ViewDef,
  FieldDef,
} from './schema.js'

// Data export shape consumed by React hub (from .lac/graph.json)
export interface LacDataExport {
  graph: import('./schema.js').LacGraph
  index: import('./schema.js').LacIndex
}
