import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Retrieve step details and source code examples for a specific tutorial step in Eve series.",
  inputSchema: z.object({
    series: z.enum(["eve-core", "eve-advanced", "eve-capstone"]),
    stepNumber: z.number().min(1).max(7),
  }),
  async execute(input) {
    const tutorialData: Record<string, Record<number, { title: string; feature: string; codeSnippet: string }>> = {
      "eve-core": {
        1: { title: "Instructions: Your Agent's Brain", feature: "instructions.md", codeSnippet: "# Identity\nYou are a personal research assistant." },
        2: { title: "Agent Config: Choose a Model", feature: "defineAgent / agent.ts", codeSnippet: "import { defineAgent } from 'eve';\nexport default defineAgent({ model: 'openai/gpt-5.4-mini' });" },
        3: { title: "Tools: Give Your Agent Hands", feature: "defineTool / tools/", codeSnippet: "import { defineTool } from 'eve/tools';\nimport { z } from 'zod';\nexport default defineTool({ inputSchema: z.object({ city: z.string() }) });" },
        4: { title: "Skills: Reusable Playbooks", feature: "skills/", codeSnippet: "---\ndescription: Research unfamiliar topics\n---\nWhen the task is novel, gather evidence first." },
        5: { title: "Channels: Let People Talk to It", feature: "channels/", codeSnippet: "import { slackChannel } from 'eve/channels/slack';\nexport default slackChannel({ ... });" },
        6: { title: "Run It & Go Further", feature: "durable execution", codeSnippet: "eve dev" }
      },
      "eve-advanced": {
        1: { title: "Connections: Bring In External Tools", feature: "defineMcpClientConnection", codeSnippet: "export default defineMcpClientConnection({ url: 'https://mcp.linear.app/mcp' });" },
        2: { title: "Sandbox: Isolated Compute", feature: "defineSandbox / sandbox/", codeSnippet: "import { vercel } from 'eve/sandbox/vercel';\nexport default defineSandbox({ backend: vercel() });" },
        3: { title: "Subagents: Delegate Specialist Work", feature: "subagents/", codeSnippet: "export default defineAgent({ description: 'Investigate ambiguous questions' });" },
        4: { title: "Schedules: Run the Agent on a Clock", feature: "defineSchedule / schedules/", codeSnippet: "export default defineSchedule({ cron: '0 9 * * *', markdown: 'Run daily digest' });" }
      },
      "eve-capstone": {
        1: { title: "Scaffold the Digest Agent", feature: "scaffold", codeSnippet: "daily-digest/\n├── agent/\n│   ├── agent.ts\n│   └── instructions.md" },
        2: { title: "Wire GitHub & Linear Connections", feature: "connections", codeSnippet: "agent/connections/github.ts\nagent/connections/linear.ts" }
      }
    };

    const stepInfo = tutorialData[input.series]?.[input.stepNumber];
    if (!stepInfo) {
      return { found: false, message: `Step ${input.stepNumber} in ${input.series} not found.` };
    }

    return {
      found: true,
      series: input.series,
      stepNumber: input.stepNumber,
      title: stepInfo.title,
      feature: stepInfo.feature,
      codeSnippet: stepInfo.codeSnippet,
    };
  },
});
