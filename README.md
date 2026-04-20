# @lifeascode

Structured knowledge graph for software features, decisions, and docs.

Document your project as typed nodes (`feature`, `decision`, `bug`, `epic`, `research`, `runbook`, `faq`, `release`) with audience-specific views (`dev`, `product`, `user`, `support`, `tester`). Build a graph, explore it in a React hub, or let Claude navigate it via 20 MCP tools.

```
npm install -g @lifeascode
```

---

## Quick start

```bash
lac init                                  # scaffold lac.config.json
lac create feature "User Login" -d auth  # create nodes/auth/feature-user-login-xxxx/node.md
lac fill feature-user-login              # AI-fill missing fields (needs ANTHROPIC_API_KEY)
lac build                                # emit .lac/graph.json + .lac/index.json
lac serve                                # live hub at http://localhost:3737
lac lint                                 # validate all nodes
```

---

## Node format

Nodes are plain Markdown with YAML frontmatter:

```markdown
---
id: feature-user-login-x1a2
type: feature
title: User Login
status: active
domain: auth
schemaVersion: 2
priority: 1
tags: [auth, security]
views:
  dev:
    componentFile: src/screens/LoginScreen.tsx
    npmPackages: [expo-auth-session]
  product:
    acceptanceCriteria:
      - User can log in with email + password
      - Session persists across app restarts
---

## dev.implementation

Login flow uses Expo AuthSession with PKCE. Tokens stored in SecureStore...

## product.problem

Users need a secure, frictionless way to authenticate across sessions...

## user.userGuide

Tap **Sign In**, enter your email and password, then tap **Continue**...
```

Prose fields (`implementation`, `problem`, `userGuide`, etc.) go in `## view.field` markdown sections. Structured fields (arrays, strings) go in the YAML frontmatter under `views`.

---

## CLI commands

| Command | Description |
|---|---|
| `lac init [dir]` | Scaffold `lac.config.json` |
| `lac create <type> <title>` | Create a new `node.md` |
| `lac build [dir]` | Validate nodes → emit `.lac/graph.json` + `.lac/index.json` |
| `lac lint [dir]` | Report schema errors and lifecycle violations |
| `lac advance <id> <status>` | Validate and transition node status |
| `lac fill <id>` | AI-fill empty required fields using Claude |
| `lac status [dir]` | Health summary — counts by status, blocked nodes |
| `lac search <query>` | Full-text search across all nodes |
| `lac serve [dir]` | Live hub at `http://localhost:3737` with hot reload |
| `lac diagram [dir]` | Print Mermaid flowchart of the node graph |
| `lac export --html [dir]` | Generate self-contained `.lac/hub.html` |

### Lifecycle

```
draft → active  (requires: implementation, 1+ decision, successCriteria)
active → frozen (requires: all above + userGuide + componentFile)
frozen → active (reason required)
```

### Node types

| Type | Class | Required views |
|---|---|---|
| `feature` | permanent | dev, product |
| `bug` | absorbing | dev |
| `decision` | permanent | dev |
| `epic` | permanent | product |
| `research` | permanent | dev |
| `runbook` | permanent | support |
| `faq` | permanent | user |
| `release` | permanent | user |

---

## React components

```bash
npm install @lifeascode react react-dom
```

```tsx
import { LacHub } from '@lifeascode'

// All-in-one dashboard
<LacHub dataUrl="/.lac/graph.json" theme="dark" />

// Or pre-load data (SSR / Next.js)
import { LacDataProvider, LacSprintBoard } from '@lifeascode'

<LacDataProvider data={graph} theme="dark">
  <LacSprintBoard />
</LacDataProvider>
```

### Components

| Component | Purpose |
|---|---|
| `LacHub` | Full dashboard — Sprint, Guide, Decisions, Success, Search tabs |
| `LacFeatureCard` | Node detail with view tabs, markdown render, relationships |
| `LacSprintBoard` | Draft/active nodes sorted by priority |
| `LacDecisionLog` | All decision nodes with choice preview |
| `LacSearch` | Real-time full-text search |
| `LacGuide` | FAQ + runbook + frozen feature browser |
| `LacSuccessBoard` | Nodes with success criteria |
| `LacHelpPanel` | Floating/inline node lookup by ID or query |

All components are inline-styled — zero CSS dependencies.

---

## MCP server

Wire `lac-mcp` into Claude Code or Claude Desktop:

```json
{
  "mcpServers": {
    "lac": {
      "command": "lac-mcp",
      "cwd": "/path/to/your/project"
    }
  }
}
```

20 tools: `get_node_status`, `roadmap_view`, `create_node`, `write_node_fields`, `advance_node`, `fill_node`, `search_nodes`, `audit_decisions`, `node_summary_for_pr`, and more.

---

## Configuration

`lac.config.json` at the project root:

```json
{
  "schemaVersion": 2,
  "project": "my-app",
  "extends": ["@lifeascode"],
  "types": {
    "spike": { "id": "spike", "label": "Spike", "class": "permanent", "requiredViews": ["dev"] }
  },
  "views": {
    "dev": {
      "fields": {
        "performanceNotes": { "type": "prose", "label": "Performance Notes" }
      }
    }
  },
  "hub": {
    "defaultTab": "sprint",
    "accentColor": "#c4a255"
  }
}
```

---

## Playground

```bash
cd playground && bun run dev   # http://localhost:5173
```

The playground is self-documenting — its fixture `graph.json` contains `@lifeascode` documenting its own features, decisions, and guides as LAC nodes.

---

## License

MIT
