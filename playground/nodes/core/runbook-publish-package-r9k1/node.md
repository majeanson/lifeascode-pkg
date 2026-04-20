---
id: runbook-publish-package-r9k1
type: runbook
title: Publish @lifeascode to npm
status: active
domain: core
schemaVersion: 2
priority: 3
tags: [publish, npm, release]
views:
  support:
    escalationPath: Check npm registry at https://www.npmjs.com/package/@lifeascode
---

## support.steps

1. `bun run build` — clean compile, no TS errors
2. `cd playground && bun install && bun run build` — playground builds against dist/
3. `node dist/cli/bin.cjs build playground/` — `lac build` passes on the fixture workspace
4. `node dist/cli/bin.cjs lint playground/` — `lac lint` passes with no errors
5. `npm version patch|minor|major` — bump version in package.json
6. `npm publish --access public` — publish to npm

## support.rollback

If a bad version is published: `npm deprecate @lifeascode@<version> "use <newer>"`.
Cannot unpublish after 72 hours — deprecate instead.
