import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Provide route navigation, URL links, and structural information for vantolbennett.com.",
  inputSchema: z.object({
    destination: z.string().describe("Target area or query e.g. 'tutorials', 'eve agent', 'blog', 'projects', 'about'"),
  }),
  async execute(input) {
    const navMap: Record<string, { path: string; title: string; description: string }> = {
      "eve": { path: "/eve", title: "Eve AI Agent Studio", description: "Interactive Eve Agent playground & filesystem inspector." },
      "learn": { path: "/learn", title: "Learn & Tutorials", description: "Hands-on series covering Eve Core, Eve Advanced, Eve Capstone, Nuxt 4, and Vue Vapor." },
      "blog": { path: "/blog", title: "Blog & Articles", description: "In-depth engineering notes on AI agents, monorepos, and full-stack web tech." },
      "projects": { path: "/projects", title: "Projects & Open Source", description: "Open source tools and projects including teacher-toolkit and null-agent." },
      "about": { path: "/about", title: "About Vantol Bennett", description: "Background, stack, and philosophy." },
    };

    const dest = input.destination.toLowerCase();
    const matchedKey = Object.keys(navMap).find((k) => dest.includes(k)) || "eve";
    const routeInfo = navMap[matchedKey];

    return {
      destination: input.destination,
      matchedRoute: routeInfo,
      allRoutes: Object.values(navMap),
    };
  },
});
