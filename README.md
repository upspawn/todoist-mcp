# Todoist MCP Server 🚀

[![CI](https://img.shields.io/github/actions/workflow/status/upspawn/todoist-mcp/ci.yml?style=for-the-badge)](https://github.com/upspawn/todoist-mcp/actions)
[![npm](https://img.shields.io/npm/v/@upspawn/todoist-mcp.svg?style=for-the-badge)](https://www.npmjs.com/package/@upspawn/todoist-mcp)
[![coverage](https://img.shields.io/badge/coverage-92%25-brightgreen?style=for-the-badge)](./coverage)
[![license](https://img.shields.io/github/license/upspawn/todoist-mcp?style=for-the-badge)](LICENSE)

> **Instantly connect any LLM to Todoist** – Manage tasks, projects, comments & productivity stats through the Model Context Protocol (MCP) **with one command**:
>
> ```bash
> npx -y @upspawn/todoist-mcp
> ```

---

## ✨ Why Todoist-MCP?

| 🔥 Feature | 🚀 Details |
|-----------|-----------|
| **Full Todoist API** | Projects, Sections, Tasks, Comments, Labels & Productivity – **32 typed tools** ready to call. |
| **Natural-language Quick Add** | `"Pay rent tomorrow 9am #Finance p1"` ➜ instant task. |
| **Rate-limit Smart** | Tracks **450 req / 15 min** & retries with exponential back-off. |
| **Battle-tested** | **92 % coverage** · 150+ unit / integration tests · ESLint + Prettier + Husky. |
| **Zero boilerplate** | One `npx` – no server, no auth dance, just stdin↔stdout JSON. |
| **TypeScript ♥** | End-to-end types, Zod schemas, strict mode everywhere. |
| **Open-Source Friendly** | MIT licensed & production-ready CI/CD. |

---

## 🚀 Quick Start (60 sec)

1. **Get a Todoist token** → <https://todoist.com/prefs/integrations>
2. **Add to `mcp.json`**

   ```json
   {
     "todoist": {
       "command": "npx",
       "args": ["-y", "@upspawn/todoist-mcp"],
       "env": { "TODOIST_API_KEY": "<your-token>" }
     }
   }
   ```
3. **Ask your AI**:  
   `"Add \"Review PR #42\" for tomorrow 10 am #Work"`

That's it! 🎉

---

## 📚 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Usage Snippets](#usage-snippets)
- [Development Guide](#development-guide)
- [Contributing](#contributing)
- [License](#license)

---

## 🛠️ Installation

### Production / CI

```bash
npx -y @upspawn/todoist-mcp  # starts the MCP server
```

### Local Dev

```bash
git clone https://github.com/upspawn/todoist-mcp.git
cd todoist-mcp
npm i
npm run dev  # ts-node + nodemon hot-reload
```

---

## ⚙️ Configuration

### Environment Vars

| Var | Required | Default | Description |
|-----|----------|---------|-------------|
| `TODOIST_API_KEY` | ✔︎ | – | 40-char personal API token |
| `TODOIST_API_BASE_URL` | ✖︎ | `https://api.todoist.com/rest/v2` | Override for mocks/self-hosted |
| `DEBUG` | ✖︎ | `false` | Verbose logging |

Create a `.env`:

```dotenv
TODOIST_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEBUG=true
```

---

## 🔧 Available Tools (32)

<details>
<summary>Click to expand</summary>

### Projects
`list_projects`, `create_project`, `get_project`, `update_project`, `delete_project`, `get_project_collaborators`

### Tasks
`list_tasks`, `create_task`, `get_task`, `update_task`, `close_task`, `reopen_task`, `delete_task`, **`quick_add_task`**

### Sections
`list_sections`, `create_section`, `get_section`, `update_section`, `delete_section`

### Comments
`list_comments`, `create_comment`, `get_comment`, `update_comment`, `delete_comment`

### Labels
`list_labels`, `create_label`, `get_label`, `update_label`, `delete_label`

### Productivity & Completion
`get_completed_tasks`, `get_completed_tasks_by_project`, `get_productivity_stats`

</details>

---

## 🔥 Usage Snippets

```text
📝  "Create task 'Draft Q4 roadmap' for next Monday 9am #Product p1"
📅  "Show me tasks due this week in #Personal"
🚀  "Quick-add 'Publish release notes every Friday 4pm #Chores p2'"
🎯  "Get productivity stats for last month"
```

---

## 🧑‍💻 Development Guide

```bash
# Build & run tests
npm run build && npm test -- --coverage

# Lint & format
npm run lint && npm run format

# Generate HTML coverage report
open coverage/lcov-report/index.html
```

### Architectural Overview

```text
┌────────────┐   stdin   ┌───────────────────┐   HTTPS    ┌──────────────┐
│   Client   │◀─────────▶│ Todoist-MCP Server│───────────▶│ Todoist REST │
└────────────┘  JSON-RPC └───────────────────┘   Axios    └──────────────┘
```

- **Transport**: JSON-RPC 2.0 over stdio (MCP spec)  
- **Core**: `tool-handlers.ts` – 32 strongly-typed operations  
- **Network**: `todoist-api.ts` – Axios client with retries & rate-limit guard  
- **Tests**: Jest + ts-jest (≥ 92 % coverage)  

---

## 🤝 Contributing

1. **Fork & clone** the repo
2. `npm i`
3. Create a branch: `git checkout -b feat/amazing`
4. Add **tests** & **docs**
5. `npm run lint && npm test`
6. Open a PR – we ❤️ contributors!

> Tip: run `npm run test:watch` for TDD flow.

---

## 📜 License

Released under the **MIT License** – see [`LICENSE`](LICENSE).

Made with ☕ & ❤️  by the **[@upspawn](https://github.com/upspawn)** team.
