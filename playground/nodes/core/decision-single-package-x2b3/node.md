---
id: decision-single-package-x2b3
type: decision
title: Ship as a single @lifeascode npm package
status: active
domain: core
schemaVersion: 2
priority: 2
tags: [packaging, npm, dx]
views:
  dev:
    componentFile: package.json
    npmPackages: ['tsup', 'bun']
---

## dev.rationale

A single package means one install, one version to track, one changelog.
Sub-packages fragment the install surface and force users to manage peer dependencies.
The tradeoff is a larger package size, acceptable because tree-shaking handles unused exports.

## dev.choice

Single `@lifeascode` package with 5 tsup build entries:
CLI (CJS), schema/types (ESM+CJS+DTS), React components (ESM+CJS+DTS),
MCP server (CJS), browser IIFE hub bundle.

## dev.edgeCases

`@anthropic-ai/sdk` is optional — `lac fill` and `fill_node` (MCP) require it at runtime
but the package does not list it as a hard dependency to avoid bloating installs that
don't need AI fill.
