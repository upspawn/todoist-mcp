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

## 🚀 Getting Started

First, get your Todoist API token from <https://todoist.com/prefs/integrations>.

### Requirements
- Node.js 18 or newer
- VS Code, Cursor, Windsurf, Claude Desktop, Goose or any other MCP client

### Installation by Client

**Standard config** works in most tools:
```json
{
  "mcpServers": {
    "todoist": {
      "command": "npx",
      "args": ["-y", "@upspawn/todoist-mcp"],
      "env": {
        "TODOIST_API_KEY": "your-todoist-api-key-here"
      }
    }
  }
}
```

#### Claude Code
Use the Claude Code CLI to add the Todoist MCP server:
```bash
claude mcp add todoist npx @upspawn/todoist-mcp
```

#### Claude Desktop
Follow the MCP install [guide](https://modelcontextprotocol.io/quickstart/user), use the standard config above.

#### Cursor
Go to `Cursor Settings` → `MCP` → `Add new MCP Server`. Name it "todoist", use `command` type with the command `npx @upspawn/todoist-mcp`. Add your `TODOIST_API_KEY` environment variable.

#### Gemini CLI
Follow the MCP install [guide](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#configure-the-mcp-server-in-settingsjson), use the standard config above.

#### Goose
Go to `Advanced settings` → `Extensions` → `Add custom extension`. Name it "todoist", use type `STDIO`, and set the `command` to `npx @upspawn/todoist-mcp`. Add your `TODOIST_API_KEY` environment variable.

#### LM Studio
Go to `Program` in the right sidebar → `Install` → `Edit mcp.json`. Use the standard config above.

#### Qodo Gen
Open [Qodo Gen](https://docs.qodo.ai/qodo-documentation/qodo-gen) chat panel in VSCode or IntelliJ → Connect more tools → + Add new MCP → Paste the standard config above. Click `Save`.

#### VS Code
Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server), use the standard config above.

You can also install using the VS Code CLI:
```bash
code --add-mcp '{"name":"todoist","command":"npx","args":["-y","@upspawn/todoist-mcp"],"env":{"TODOIST_API_KEY":"your-api-key"}}'
```

#### Windsurf
Follow Windsurf MCP [documentation](https://docs.windsurf.com/windsurf/cascade/mcp). Use the standard config above.

### Docker Installation

If you prefer using Docker:

1. **Pull the image** (when available):
```bash
docker pull upspawn/todoist-mcp:latest
```

2. **Or build locally**:
```bash
git clone https://github.com/upspawn/todoist-mcp.git
cd todoist-mcp
npm run build
docker build -t todoist-mcp .
```

3. **Run with your API key**:
```bash
docker run -e TODOIST_API_KEY=your-api-key todoist-mcp
```

4. **Docker Compose** example:
```yaml
version: '3.8'
services:
  todoist-mcp:
    image: upspawn/todoist-mcp:latest
    environment:
      - TODOIST_API_KEY=your-api-key
      - DEBUG=false
    stdin_open: true
    tty: true
```

### Quick Test

Once configured, ask your AI:  
`"Add 'Review PR #42' for tomorrow 10 am #Work"`

That's it! 🎉

### ✅ API v1 Compliance Verified

Our implementation is **100% compliant** with the [official Todoist API v1 documentation](https://developer.todoist.com/api/v1/):

- 🎯 **36/36 integration tests passing** with real Todoist Pro API
- ✅ All endpoint URLs correctly migrated from deprecated `/rest/v2` to current `/api/v1`  
- ✅ All object naming follows v1 conventions
- ✅ **Pro Account Features**: Full CRUD operations work perfectly
- 🔧 Legacy endpoint deprecations gracefully handled
- 📖 See [`docs/integration-test-results.md`](docs/integration-test-results.md) for full details

---

## 📚 Table of Contents

- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Available Tools](#-available-tools-32)
- [Usage Snippets](#-usage-snippets)
- [Development Guide](#-development-guide)
- [Contributing](#-contributing)
- [License](#-license)

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

### Configuration Examples

Check the [`examples/`](examples/) directory for various configuration options:
- [`mcp.json`](examples/mcp.json) - Standard npm-based configuration
- [`local-mcp.json`](examples/local-mcp.json) - Local development configuration
- [`docker-mcp.json`](examples/docker-mcp.json) - Docker-based configuration

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

### Local Development

```bash
# Clone and setup
git clone https://github.com/upspawn/todoist-mcp.git
cd todoist-mcp
npm i

# Development with hot-reload
npm run dev  # ts-node + nodemon hot-reload

# Build & run tests
npm run build && npm test -- --coverage

# Lint & format
npm run lint && npm run format

# Generate HTML coverage report
open coverage/lcov-report/index.html
```

### Docker Development

```bash
# Build Docker image
npm run build
docker build -t todoist-mcp .

# Run with Docker Compose
echo "TODOIST_API_KEY=your-api-key" > .env
docker-compose up

# Run tests in Docker
docker run --rm -v $(pwd):/app -w /app node:20-alpine npm test
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
