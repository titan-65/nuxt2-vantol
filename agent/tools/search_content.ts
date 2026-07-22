import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Search site content including blog posts, tutorials (eve-core, eve-advanced, eve-capstone, etc.), and projects.",
  inputSchema: z.object({
    query: z.string().describe("Search keywords or topics"),
    category: z.enum(["all", "blog", "learn", "projects"]).optional().default("all"),
  }),
  async execute(input) {
    const query = input.query.toLowerCase();
    
    // Core search index simulation/data source
    const items = [
      {
        title: "Learning Eve: Build Your First Agent",
        slug: "learn/eve-core",
        category: "learn",
        snippet: "Filesystem-first framework for durable AI agents. Build instructions, agent.ts, tools, skills, and channels.",
      },
      {
        title: "Eve Advanced: Connections, Sandboxes, & Schedules",
        slug: "learn/eve-advanced",
        category: "learn",
        snippet: "Wire MCP/OpenAPI connections, Vercel Sandboxes, subagents, cron schedules, hooks, and deployment.",
      },
      {
        title: "Eve Capstone: The Daily Research Digest",
        slug: "learn/eve-capstone",
        category: "learn",
        snippet: "Build a production Daily Research Digest agent with GitHub/Linear MCP, researcher subagent, and Slack channel.",
      },
      {
        title: "Building Null Agent: A Terminal Web App",
        slug: "blog/building-null-agent",
        category: "blog",
        snippet: "Architecting a sleek dark-mode web terminal agent interface with Vue, Vite, and AI execution.",
      },
      {
        title: "Vite+ & Monorepo Toolchain Setup",
        slug: "blog/viteplus-unified-toolchain",
        category: "blog",
        snippet: "Unified build toolchain, workspace orchestration, and fast dev workflows.",
      },
    ];

    const results = items.filter((item) => {
      const matchCategory = input.category === "all" || item.category === input.category;
      const matchQuery = item.title.toLowerCase().includes(query) || item.snippet.toLowerCase().includes(query);
      return matchCategory && matchQuery;
    });

    return {
      query: input.query,
      count: results.length,
      results: results.length > 0 ? results : items.slice(0, 3), // fallback suggestions if no direct match
    };
  },
});
