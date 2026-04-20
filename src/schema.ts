import { z } from 'zod'

export const LacStatusSchema = z.enum(['draft', 'active', 'frozen', 'deprecated'])

export const LacStatusTransitionSchema = z.object({
  from: LacStatusSchema,
  to: LacStatusSchema,
  date: z.string(),
  reason: z.string().optional(),
})

export const LacAnnotationSchema = z.object({
  id: z.string(),
  author: z.string(),
  date: z.string(),
  type: z.string(),
  body: z.string(),
})

export const LacFieldLockSchema = z.object({
  field: z.string(),
  lockedAt: z.string(),
  lockedBy: z.string(),
  reason: z.string().optional(),
})

export const LacNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  status: LacStatusSchema,
  domain: z.string(),
  schemaVersion: z.literal(2),
  priority: z.number().int().min(1).optional(),
  tags: z.array(z.string()).optional(),
  owner: z.string().optional(),
  jira: z.union([z.string(), z.array(z.string())]).optional(),
  // Relationships
  parent: z.string().optional(),
  children: z.array(z.string()).optional(),
  blockedBy: z.array(z.string()).optional(),
  enables: z.array(z.string()).optional(),
  references: z.array(z.string()).optional(),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
  fixes: z.string().optional(),
  resolvedInto: z.array(z.string()).optional(),
  // History & locks
  statusHistory: z.array(LacStatusTransitionSchema).optional(),
  annotations: z.array(LacAnnotationSchema).optional(),
  fieldLocks: z.array(LacFieldLockSchema).optional(),
  nodeLocked: z.boolean().optional(),
  // Views: flexible record of view → field → value
  views: z.record(z.record(z.unknown())),
})

export const LacEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string(),
})

export const LacGraphSchema = z.object({
  schemaVersion: z.literal(2),
  project: z.string(),
  generated: z.string(),
  nodes: z.array(LacNodeSchema),
  edges: z.array(LacEdgeSchema),
  meta: z.object({
    counts: z.object({ nodes: z.number(), edges: z.number() }),
    domains: z.array(z.string()),
  }),
})

export const LacIndexEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  status: LacStatusSchema,
  domain: z.string(),
  priority: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

export const LacIndexSchema = z.object({
  schemaVersion: z.literal(2),
  project: z.string(),
  generated: z.string(),
  nodes: z.array(LacIndexEntrySchema),
})

export const FieldDefSchema = z.object({
  type: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
  prose: z.boolean().optional(),
})

export const ViewDefSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  fields: z.record(FieldDefSchema).optional(),
})

export const TypeDefSchema = z.object({
  id: z.string(),
  label: z.string(),
  class: z.enum(['permanent', 'absorbing']),
  description: z.string().optional(),
  defaultStatus: LacStatusSchema.optional(),
  requiredViews: z.array(z.string()).optional(),
  statusTransitions: z.record(z.array(LacStatusSchema)).optional(),
})

export const LacConfigSchema = z.object({
  schemaVersion: z.literal(2),
  project: z.string(),
  extends: z.array(z.string()).optional(),
  types: z.record(TypeDefSchema).default({}),
  views: z.record(ViewDefSchema).default({}),
  index: z
    .object({
      summaryFields: z.array(z.string()).optional(),
      searchFields: z.array(z.string()).optional(),
    })
    .optional(),
  hub: z
    .object({
      defaultView: z.string().optional(),
      defaultTab: z.string().optional(),
      accentColor: z.string().optional(),
    })
    .optional(),
})

export type LacStatus = z.infer<typeof LacStatusSchema>
export type LacStatusTransition = z.infer<typeof LacStatusTransitionSchema>
export type LacAnnotation = z.infer<typeof LacAnnotationSchema>
export type LacFieldLock = z.infer<typeof LacFieldLockSchema>
export type LacNode = z.infer<typeof LacNodeSchema>
export type LacEdge = z.infer<typeof LacEdgeSchema>
export type LacGraph = z.infer<typeof LacGraphSchema>
export type LacIndexEntry = z.infer<typeof LacIndexEntrySchema>
export type LacIndex = z.infer<typeof LacIndexSchema>
export type LacConfig = z.infer<typeof LacConfigSchema>
export type TypeDef = z.infer<typeof TypeDefSchema>
export type ViewDef = z.infer<typeof ViewDefSchema>
export type FieldDef = z.infer<typeof FieldDefSchema>
