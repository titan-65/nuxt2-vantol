import { PORTFOLIO_KNOWLEDGE, SITE_PAGES, type SitePage } from "./sitemap";

export interface AssistantAction {
  type: "navigate" | "action";
  target: string;
  label: string;
}

export interface AssistantResponse {
  answer: string;
  action?: AssistantAction;
  suggestions: string[];
  matchedPages: SitePage[];
}

export function processQuery(rawQuery: string): AssistantResponse {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return {
      answer: "How can I help you today? Ask me about Vantol's projects, tutorials, or site navigation!",
      suggestions: [
        "Who is Vantol Bennett?",
        "What projects are featured?",
        "Show me Nuxt tutorials",
        "Sign the guestbook",
      ],
      matchedPages: [],
    };
  }

  // Intent 1: Tech Skills / Stack (check before bio so "skills of Vantol" maps to stack)
  if (query.includes("skill") || query.includes("stack") || query.includes("technology") || query.includes("languages")) {
    const frontend = PORTFOLIO_KNOWLEDGE.skills.frontend.join(", ");
    const backend = PORTFOLIO_KNOWLEDGE.skills.backend.join(", ");
    const tools = PORTFOLIO_KNOWLEDGE.skills.tools.join(", ");

    return {
      answer: `**Tech Stack Breakdown:**\n\n- **Frontend:** ${frontend}\n- **Backend & APIs:** ${backend}\n- **Tooling & Infra:** ${tools}`,
      action: {
        type: "navigate",
        target: "/about",
        label: "Explore Skills on About Page",
      },
      suggestions: [
        "Show projects built with Vue/Nuxt",
        "Read Nuxt module tutorials",
        "View uses & hardware setup",
      ],
      matchedPages: SITE_PAGES.filter((p) => p.path === "/about" || p.path === "/uses"),
    };
  }

  // Intent 2: Learn / Tutorials / Series / Modules
  if (query.includes("tutorial") || query.includes("learn") || query.includes("course") || query.includes("series") || query.includes("module")) {
    const seriesList = PORTFOLIO_KNOWLEDGE.tutorialSeries
      .map((s) => `• **[${s.title}](${s.path})**: ${s.description}`)
      .join("\n");

    return {
      answer: `Interactive step-by-step tutorial series available under **/learn**:\n\n${seriesList}`,
      action: {
        type: "navigate",
        target: "/learn",
        label: "Start Learning",
      },
      suggestions: [
        "Tell me about Nuxt module tutorials",
        "Show latest blog posts",
        "Browse project showcase",
      ],
      matchedPages: SITE_PAGES.filter((p) => p.category === "learn"),
    };
  }

  // Intent 3: Projects / Work / Packages
  if (query.includes("project") || query.includes("package") || query.includes("null-agent") || query.includes("presence") || query.includes("work showcase")) {
    const projectList = PORTFOLIO_KNOWLEDGE.projects
      .map((p) => `• **[${p.name}](${p.path})** (${p.tag}): ${p.description}`)
      .join("\n");

    return {
      answer: `Here are key open-source projects and packages built by Vantol:\n\n${projectList}`,
      action: {
        type: "navigate",
        target: "/projects",
        label: "Browse All Projects",
      },
      suggestions: [
        "Tell me about nuxt-presence",
        "What is null-agent?",
        "Read Nuxt module tutorials",
      ],
      matchedPages: SITE_PAGES.filter((p) => p.category === "projects"),
    };
  }

  // Intent 4: Guestbook / Wall / Signatures
  if (query.includes("guestbook") || query.includes("sign") || query.includes("wall") || query.includes("leave message")) {
    return {
      answer: "You can leave your mark or sign the visitor wall on the **Guestbook** page! It persists real-time signatures and messages.",
      action: {
        type: "navigate",
        target: "/guestbook",
        label: "Open Guestbook",
      },
      suggestions: [
        "What is nuxt-presence?",
        "Who is Vantol Bennett?",
        "Show blog stats",
      ],
      matchedPages: SITE_PAGES.filter((p) => p.path === "/guestbook"),
    };
  }

  // Intent 5: Who is Vantol / Bio / Background
  if (query.includes("who is") || query.includes("about") || query.includes("bio") || query.includes("vantol") || query.includes("background")) {
    const expSummary = PORTFOLIO_KNOWLEDGE.experience
      .map((e) => `• **${e.role}** at ${e.company} (${e.period})`)
      .join("\n");

    return {
      answer: `**${PORTFOLIO_KNOWLEDGE.name}** is a ${PORTFOLIO_KNOWLEDGE.title}.\n\n${PORTFOLIO_KNOWLEDGE.bio}\n\n**Career Highlights:**\n${expSummary}`,
      action: {
        type: "navigate",
        target: "/about",
        label: "View Full Bio & Experience",
      },
      suggestions: [
        "What are Vantol's core tech skills?",
        "Show featured projects",
        "View Nuxt 4 tutorial series",
      ],
      matchedPages: SITE_PAGES.filter((p) => p.path === "/about"),
    };
  }

  // Intent 6: Blog / Articles
  if (query.includes("blog") || query.includes("article") || query.includes("post") || query.includes("write")) {
    return {
      answer: "The blog features 30+ deep technical articles covering Nuxt 4, Vue 3, Nitro, Drizzle, Vite+, and React Native performance optimizations.",
      action: {
        type: "navigate",
        target: "/blog",
        label: "Read Blog Articles",
      },
      suggestions: [
        "Show Nuxt tutorial series",
        "View blog statistics",
        "Search projects",
      ],
      matchedPages: SITE_PAGES.filter((p) => p.path === "/blog"),
    };
  }

  // Intent 7: General sitemap keyword search fallback
  const matchedPages = SITE_PAGES.filter((page) =>
    page.title.toLowerCase().includes(query) ||
    page.description.toLowerCase().includes(query) ||
    page.keywords.some((k) => query.includes(k))
  );

  if (matchedPages.length > 0) {
    const firstMatch = matchedPages[0]!;
    const pagesList = matchedPages
      .map((p) => `• **[${p.title}](${p.path})**: ${p.description}`)
      .join("\n");

    return {
      answer: `Here are relevant pages on the site for your query:\n\n${pagesList}`,
      action: {
        type: "navigate",
        target: firstMatch.path,
        label: `Go to ${firstMatch.title}`,
      },
      suggestions: [
        "Who is Vantol Bennett?",
        "View projects showcase",
        "Read Nuxt tutorials",
      ],
      matchedPages,
    };
  }

  // Default fallback answer
  return {
    answer: `I couldn't find an exact match for "${rawQuery}", but you can explore our major sections below or ask me about Vantol's bio, projects, tutorials, or blog!`,
    action: {
      type: "navigate",
      target: "/explore",
      label: "Explore Site Directory",
    },
    suggestions: [
      "Who is Vantol Bennett?",
      "Show me Nuxt tutorials",
      "View projects showcase",
      "Open visitor guestbook",
    ],
    matchedPages: SITE_PAGES.slice(0, 3),
  };
}
