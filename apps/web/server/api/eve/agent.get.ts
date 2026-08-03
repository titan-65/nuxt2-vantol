import { defineEventHandler } from "h3";
import fs from "node:fs";
import path from "node:path";

export default defineEventHandler(async (event) => {
  const rootDir = process.cwd();
  const agentDir = path.join(rootDir, "agent");

  function getFileContent(filePath: string): string {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8");
      }
    } catch (e) {
      // fallback
    }
    return "";
  }

  const instructions = getFileContent(path.join(agentDir, "instructions.md"));
  const config = getFileContent(path.join(agentDir, "agent.ts"));

  const tools = [
    {
      name: "search_content",
      path: "agent/tools/search_content.ts",
      code: getFileContent(path.join(agentDir, "tools/search_content.ts")),
    },
    {
      name: "get_tutorial_step",
      path: "agent/tools/get_tutorial_step.ts",
      code: getFileContent(path.join(agentDir, "tools/get_tutorial_step.ts")),
    },
    {
      name: "site_navigator",
      path: "agent/tools/site_navigator.ts",
      code: getFileContent(path.join(agentDir, "tools/site_navigator.ts")),
    },
    {
      name: "run_code_sandbox",
      path: "agent/tools/run_code_sandbox.ts",
      code: getFileContent(path.join(agentDir, "tools/run_code_sandbox.ts")),
    },
  ];

  const skills = [
    {
      name: "eve_framework_guide",
      path: "agent/skills/eve_framework_guide.md",
      content: getFileContent(path.join(agentDir, "skills/eve_framework_guide.md")),
    },
    {
      name: "tutorial_companion",
      path: "agent/skills/tutorial_companion.md",
      content: getFileContent(path.join(agentDir, "skills/tutorial_companion.md")),
    },
  ];

  const connections = [
    {
      name: "github",
      path: "agent/connections/github.ts",
      code: getFileContent(path.join(agentDir, "connections/github.ts")),
    },
  ];

  const subagents = [
    {
      name: "researcher",
      path: "agent/subagents/researcher/agent.ts",
      code: getFileContent(path.join(agentDir, "subagents/researcher/agent.ts")),
      instructions: getFileContent(path.join(agentDir, "subagents/researcher/instructions.md")),
    },
  ];

  const schedules = [
    {
      name: "daily_digest",
      path: "agent/schedules/daily_digest.ts",
      code: getFileContent(path.join(agentDir, "schedules/daily_digest.ts")),
    },
  ];

  return {
    name: "Eve Site Assistant",
    status: "active",
    framework: "Vercel Eve v1.0",
    model: "openai/gpt-5.4-mini",
    filesystem: {
      instructions,
      config,
      tools,
      skills,
      connections,
      subagents,
      schedules,
    },
  };
});
