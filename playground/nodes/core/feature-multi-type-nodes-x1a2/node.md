---
id: feature-multi-type-nodes-x1a2
type: feature
title: Multi-Type Nodes
status: active
domain: core
schemaVersion: 2
priority: 1
tags: [schema, nodes, types]
views:
  dev:
    componentFile: src/schema/index.ts
    npmPackages: []
  product:
    acceptanceCriteria:
      - Supports feature, bug, decision, epic, research, runbook, faq, release node types
      - Each type has required views and validation rules
      - Custom types can be added via lac.config.json
---

## dev.implementation

Each node type is defined in `src/node-types/*.json` and merged with the loaded config.
The Zod schema validates per-type required views at `lac build` time.
Types are extensible — projects can add custom types in `lac.config.json` under `types`.

## product.problem

Different artifacts in a software project have different shapes: a bug needs reproduction steps,
a decision needs rationale and alternatives, a runbook needs step-by-step instructions.
A single "feature" type forces everything into an awkward shape.

## product.successCriteria

All 8 built-in types validate correctly with `lac lint`.
Custom types defined in config pass through without errors.
