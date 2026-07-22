---
description: Guide users through Eve framework principles (filesystem-first, instructions, tools, connections, subagents, schedules)
---

# Eve Framework Guide Playbook

When explaining Eve framework concepts to users:
1. **Emphasize Filesystem-First Architecture**: Eve agents are directories of ordinary files (`instructions.md`, `agent.ts`, `tools/`, `skills/`, `connections/`, `subagents/`, `schedules/`).
2. **Explain Durable Execution**: Sessions stream progress, execute tools, can pause for human approval, and resume via the open-source Workflow engine.
3. **Contrast Ephemeral vs. Durable**: Explain how Eve avoids stateless chat loss by persisting turn states in Nitro/Workflow storage.
4. **Provide Runnable Code Examples**: Show how `defineTool` and Zod work seamlessly together.
