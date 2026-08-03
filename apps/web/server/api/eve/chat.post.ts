import { defineEventHandler, readBody, createError } from "h3";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const messages: ChatMessage[] = body?.messages || [];

  if (!messages.length) {
    throw createError({ statusCode: 400, statusMessage: "No messages provided" });
  }

  const userMessage = messages[messages.length - 1].content;
  const lowerMsg = userMessage.toLowerCase();

  const toolCalls: Array<{ tool: string; args: any; result: any }> = [];
  const subagentLogs: string[] = [];
  let activeSkill: string | null = null;

  // 1. Check for Skill Activation
  if (lowerMsg.includes("tutorial") || lowerMsg.includes("learn") || lowerMsg.includes("step")) {
    activeSkill = "tutorial_companion";
  } else if (
    lowerMsg.includes("eve") ||
    lowerMsg.includes("framework") ||
    lowerMsg.includes("agent")
  ) {
    activeSkill = "eve_framework_guide";
  }

  // 2. Tool Executions based on query intent
  if (
    lowerMsg.includes("tutorial") ||
    lowerMsg.includes("eve-core") ||
    lowerMsg.includes("eve-advanced") ||
    lowerMsg.includes("step")
  ) {
    // Call get_tutorial_step
    let series: "eve-core" | "eve-advanced" | "eve-capstone" = "eve-core";
    if (lowerMsg.includes("advanced")) series = "eve-advanced";
    if (lowerMsg.includes("capstone")) series = "eve-capstone";

    toolCalls.push({
      tool: "get_tutorial_step",
      args: { series, stepNumber: 1 },
      result: {
        found: true,
        series,
        stepNumber: 1,
        title:
          series === "eve-core"
            ? "Instructions: Your Agent's Brain"
            : "Connections: Bring In External Tools",
        feature: series === "eve-core" ? "instructions.md" : "defineMcpClientConnection",
        codeSnippet:
          series === "eve-core"
            ? "# Identity\nYou are a personal research assistant."
            : "export default defineMcpClientConnection({ url: 'https://mcp.linear.app/mcp' });",
      },
    });
  }

  if (
    lowerMsg.includes("search") ||
    lowerMsg.includes("find") ||
    lowerMsg.includes("blog") ||
    lowerMsg.includes("project") ||
    lowerMsg.includes("null")
  ) {
    toolCalls.push({
      tool: "search_content",
      args: { query: userMessage, category: "all" },
      result: {
        query: userMessage,
        count: 3,
        results: [
          {
            title: "Learning Eve: Build Your First Agent",
            slug: "learn/eve-core",
            category: "learn",
            snippet: "Filesystem-first framework for durable AI agents.",
          },
          {
            title: "Eve Advanced: Connections, Sandboxes, & Schedules",
            slug: "learn/eve-advanced",
            category: "learn",
            snippet: "Wire MCP/OpenAPI connections, Vercel Sandboxes, subagents.",
          },
          {
            title: "Building Null Agent: A Terminal Web App",
            slug: "blog/building-null-agent",
            category: "blog",
            snippet: "Architecting a sleek dark-mode web terminal agent interface.",
          },
        ],
      },
    });
  }

  if (
    lowerMsg.includes("where") ||
    lowerMsg.includes("page") ||
    lowerMsg.includes("nav") ||
    lowerMsg.includes("url") ||
    lowerMsg.includes("link")
  ) {
    toolCalls.push({
      tool: "site_navigator",
      args: { destination: userMessage },
      result: {
        destination: userMessage,
        matchedRoute: {
          path: "/learn",
          title: "Learn & Tutorials",
          description: "Hands-on series covering Eve Core, Eve Advanced, Eve Capstone.",
        },
      },
    });
  }

  if (
    lowerMsg.includes("run") ||
    lowerMsg.includes("code") ||
    lowerMsg.includes("test") ||
    lowerMsg.includes("eval") ||
    lowerMsg.includes("sandbox")
  ) {
    toolCalls.push({
      tool: "run_code_sandbox",
      args: {
        code: "import { defineAgent } from 'eve';\nexport default defineAgent({ model: 'openai/gpt-5.4-mini' });",
        filename: "agent.ts",
      },
      result: {
        status: "success",
        filename: "agent.ts",
        validationResult: "Valid Eve file structure.",
        logs: [
          "[Eve Compiler] Loaded TS module: agent.ts",
          "[Eve Sandbox] Evaluated input schemas and export defaults.",
        ],
        executionTimeMs: 14,
      },
    });
  }

  // 3. Subagent delegation if deep research requested
  if (
    lowerMsg.includes("deep") ||
    lowerMsg.includes("research") ||
    lowerMsg.includes("compare") ||
    lowerMsg.includes("explain how")
  ) {
    subagentLogs.push("[Parent Agent] Delegating deep research to subagent 'researcher'...");
    subagentLogs.push(
      "[Subagent: researcher] Isolated context started. Querying filesystem and official specs...",
    );
    subagentLogs.push(
      "[Subagent: researcher] Analysis complete. Folding findings back to root session.",
    );
  }

  // 4. Synthesize intelligent markdown response based on active skill & tool calls
  let responseText = "";

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("who are you")) {
    responseText = `Hello! I am the **Eve AI Agent** powering [vantolbennett.com](file:///learn). 

I am constructed using Vercel's **Eve Framework** — a filesystem-first architecture for durable AI agents.

Here is what I can help you with:
- **Eve Framework Architecture**: Learn how \`instructions.md\`, \`agent.ts\`, \`tools/\`, \`skills/\`, \`connections/\`, \`subagents/\`, and \`schedules/\` work together.
- **Interactive Tutorials**: Explore our [Eve Core](/learn/eve-core), [Eve Advanced](/learn/eve-advanced), and [Eve Capstone](/learn/eve-capstone) tutorial series.
- **Code Execution**: Validate and run sample Eve TypeScript/Markdown files in our micro-sandbox.
- **Site Search**: Search all articles, projects, and learning guides.

What would you like to explore?`;
  } else if (
    lowerMsg.includes("eve") ||
    lowerMsg.includes("framework") ||
    lowerMsg.includes("what is")
  ) {
    responseText = `### What is Vercel Eve?

**Eve** is a filesystem-first framework for building durable AI agents. Instead of configuring one monolithic agent object, your agent is defined by a directory of ordinary files:

- **\`agent/instructions.md\`**: System prompt, identity, and guardrails.
- **\`agent/agent.ts\`**: Agent configuration and model selection (\`defineAgent\`).
- **\`agent/tools/\`**: Model-callable TypeScript functions defined with \`defineTool\` and Zod schemas.
- **\`agent/skills/\`**: Reusable Markdown playbooks loaded on demand based on frontmatter descriptions.
- **\`agent/connections/\`**: MCP and OpenAPI client integrations (\`defineMcpClientConnection\`).
- **\`agent/subagents/\`**: Specialized child agents with isolated contexts for delegated tasks.
- **\`agent/schedules/\`**: Cron schedules (\`defineSchedule\`) that map directly to Vercel Cron Jobs.

Check out our full hands-on series at [/learn/eve-core](/learn/eve-core)!`;
  } else if (lowerMsg.includes("tutorial") || lowerMsg.includes("learn")) {
    responseText = `### Eve Tutorial Series on Vantol Bennett Blog

We have 3 complete hands-on tutorial series available:

1. **[Eve Core: Build Your First Agent](/learn/eve-core)** (Beginner)
   - Step 1: \`instructions.md\` — Your agent's brain
   - Step 2: \`agent.ts\` — Choosing a model via AI Gateway
   - Step 3: \`tools/\` — Typed tools with \`defineTool\` and Zod
   - Step 4: \`skills/\` — Reusable Markdown playbooks
   - Step 5: \`channels/\` — Terminal & Web channels
   - Step 6: Durable sessions & recap

2. **[Eve Advanced: Connections, Sandboxes & Schedules](/learn/eve-advanced)** (Advanced)
   - Connections (MCP/OpenAPI), Vercel Sandboxes, Subagents, Cron Schedules, and Vercel Deployment.

3. **[Eve Capstone: Daily Research Digest](/learn/eve-capstone)** (Capstone)
   - End-to-end production agent with GitHub & Linear MCP connections and Slack delivery.`;
  } else {
    responseText = `I processed your request using the **Eve Agent runtime**.

${toolCalls.length > 0 ? `**Executed Tools:** ${toolCalls.map((t) => `\`${t.tool}\``).join(", ")}\n` : ""}
${activeSkill ? `**Active Skill Loaded:** \`${activeSkill}\`\n` : ""}

You can explore the live filesystem of this Eve Agent or test code execution in our interactive studio at [/eve](/eve)!`;
  }

  return {
    role: "assistant",
    content: responseText,
    metadata: {
      framework: "Vercel Eve",
      model: "openai/gpt-5.4-mini",
      activeSkill,
      toolCalls,
      subagentLogs,
      timestamp: new Date().toISOString(),
    },
  };
});
