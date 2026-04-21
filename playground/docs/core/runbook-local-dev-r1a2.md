# 📋 Run Quiet Minds locally

**Type:** Runbook · **Status:** Active · **Domain:** core · **Tags:** dev, setup, onboarding · **Priority:** 1

---

## Support

### Escalation Path

Check the @lifeascode README at lifeascode-pkg/README.md

### steps

* Install Node 18+ or Bun: https://bun.sh
* cd playground && bun install
* bun dev — starts Vite dev server at http://localhost:5173
* In a second terminal: cd .. && node dist/cli/bin.cjs serve playground/ — starts LAC hub at http://localhost:3737
* Edit any file in playground/nodes/ — the LAC hub auto-reloads

### Rollback

No database, no migrations. Stop both servers and restart.
