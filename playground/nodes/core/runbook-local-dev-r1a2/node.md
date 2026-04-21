---
id: runbook-local-dev-r1a2
type: runbook
title: Run Quiet Minds locally
status: active
domain: core
schemaVersion: 2
priority: 1
tags: [dev, setup, onboarding]
views:
  support:
    escalationPath: Check the @lifeascode README at lifeascode-pkg/README.md
    steps:
      - "Install Node 18+ or Bun: https://bun.sh"
      - "cd playground && bun install"
      - "bun dev — starts Vite dev server at http://localhost:5173"
      - "In a second terminal: cd .. && node dist/cli/bin.cjs serve playground/ — starts LAC hub at http://localhost:3737"
      - "Edit any file in playground/nodes/ — the LAC hub auto-reloads"
    rollback: No database, no migrations. Stop both servers and restart.
