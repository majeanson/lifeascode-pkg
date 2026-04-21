# 📋 Run Quiet Minds locally

> **Runbook** · Active · `dev` `setup` `onboarding`

### Escalation Path

{% hint style="info" %}
Check the @lifeascode README at lifeascode-pkg/README.md
{% endhint %}

### Steps

1. Install Node 18+ or Bun: https://bun.sh
2. cd playground && bun install
3. bun dev — starts Vite dev server at http://localhost:5173
4. In a second terminal: cd .. && node dist/cli/bin.cjs serve playground/ — starts LAC hub at http://localhost:3737
5. Edit any file in playground/nodes/ — the LAC hub auto-reloads

### Rollback

No database, no migrations. Stop both servers and restart.
