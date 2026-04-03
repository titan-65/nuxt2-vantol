---
title: null-agent
preview: Interactive coding assistant library with multi-provider LLM support, built-in tools, and multi-agent orchestration.
active: true
url: 'https://www.npmjs.com/package/null-agent'
tag: LLM, CLI, Library
image: 'https://picsum.photos/seed/null-agent/800/450'
git: https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/null-agent
stack: 
  language: TypeScript
  Backend: N/A
  Frontend: N/A
  Framework: Library / CLI
  css: N/A
---

# null-agent

Interactive coding assistant library with multi-provider LLM support, a built-in tool system, conversation persistence, project awareness, and multi-agent orchestration.

## Features

- **Multi-Provider LLM** — OpenAI and Anthropic providers with streaming support
- **10 Built-in Tools** — File read/write, shell execution, git operations
- **Orchestrator** — Spawn parallel sub-agents for complex tasks
- **Memory & Persistence** — File-based conversation storage at `~/.null-agent/memory/`
- **Project Scanning** — Auto-detect language, framework, package manager, and conventions
- **Four Interfaces** — Terminal UI, REPL, HTTP server, or one-shot CLI
- **Permission System** — Mode-based permissions (auto/confirm/plan)
- **Plugin System** — Extend with custom plugins

::Flex{gap="4"}
  ::StatBox{label="Providers" value="2+"}
  ::StatBox{label="Built-in Tools" value="10"}
  ::StatBox{label="Interfaces" value="4"}
::
