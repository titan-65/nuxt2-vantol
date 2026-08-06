import { defineEventHandler } from "h3";

export interface EveAgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  status: "active" | "idle" | "building";
  toolsCount: number;
  skillsCount: number;
  icon: string;
  category: "Assistant" | "Research" | "Social";
  updatedAt: string;
}

export default defineEventHandler(async () => {
  const agents: EveAgentMetadata[] = [
    {
      id: "assistant",
      name: "Portfolio Assistant",
      role: "General Navigation & Tutorial Companion",
      description:
        "Primary Eve agent guiding visitors through Vantol Bennett's site, project portfolio, and Nuxt 4 learning tutorials.",
      model: "openai/gpt-5.4-mini",
      status: "active",
      toolsCount: 4,
      skillsCount: 2,
      icon: "Bot",
      category: "Assistant",
      updatedAt: "Just now",
    },
    {
      id: "presence-concierge",
      name: "Presence Module Agent",
      role: "Social Mark & Guestbook Agent",
      description:
        "Interacts with signed presence marks, ed25519 cryptography tokens, and guestbook moderation in the nuxt-presence module.",
      model: "openai/gpt-5.4-mini",
      status: "active",
      toolsCount: 3,
      skillsCount: 1,
      icon: "Sparkles",
      category: "Social",
      updatedAt: "12m ago",
    },
    {
      id: "researcher",
      name: "Deep Research Subagent",
      role: "Codebase & Documentation Researcher",
      description:
        "Specialized Eve subagent designed to perform multi-step search, document summarization, and AST analysis.",
      model: "anthropic/claude-3-5-sonnet",
      status: "active",
      toolsCount: 5,
      skillsCount: 3,
      icon: "Brain",
      category: "Research",
      updatedAt: "5m ago",
    },
  ];

  return {
    success: true,
    agents,
  };
});
