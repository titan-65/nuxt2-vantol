export interface SitePage {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  category: "main" | "learn" | "projects" | "interactive";
}

export interface PortfolioKnowledge {
  name: string;
  title: string;
  bio: string;
  skills: {
    frontend: string[];
    backend: string[];
    tools: string[];
  };
  experience: Array<{
    role: string;
    company: string;
    period: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    path: string;
    tag: string;
    description: string;
  }>;
  tutorialSeries: Array<{
    title: string;
    path: string;
    description: string;
  }>;
}

export const SITE_PAGES: SitePage[] = [
  {
    path: "/",
    title: "Home",
    description: "Welcome to Vantol Bennett's developer portfolio & blog.",
    keywords: ["home", "intro", "hero", "welcome", "vantol"],
    category: "main",
  },
  {
    path: "/blog",
    title: "Blog Articles",
    description: "Deep technical articles on Nuxt 4, Vue 3, Nitro, Vite+, and web architecture.",
    keywords: ["blog", "articles", "posts", "writing", "guides"],
    category: "main",
  },
  {
    path: "/learn",
    title: "Interactive Learn Series",
    description: "Step-by-step release-note tutorials on Nuxt modules, Vue Vapor, and Vite+.",
    keywords: ["learn", "tutorials", "courses", "series", "guides", "modules"],
    category: "learn",
  },
  {
    path: "/projects",
    title: "Projects Showcase",
    description: "Open-source packages, applications, and developer tooling.",
    keywords: ["projects", "portfolio", "code", "github", "apps", "null-agent", "presence"],
    category: "projects",
  },
  {
    path: "/about",
    title: "About Vantol",
    description: "Background, work experience (MPS CEO, Zhyjenae Founder, Educator), and tech skills.",
    keywords: ["about", "bio", "experience", "resume", "skills", "background"],
    category: "main",
  },
  {
    path: "/guestbook",
    title: "Visitor Guestbook",
    description: "Sign the interactive visitor wall or leave a message.",
    keywords: ["guestbook", "wall", "presence", "signatures", "comments"],
    category: "interactive",
  },
  {
    path: "/stats",
    title: "Blog Statistics",
    description: "Analytics dashboard showing post counts, views, and interactions.",
    keywords: ["stats", "analytics", "metrics", "dashboard", "views"],
    category: "interactive",
  },
  {
    path: "/publications",
    title: "Publications",
    description: "Published books, guides, and technical literature.",
    keywords: ["publications", "books", "writing", "ebooks"],
    category: "main",
  },
  {
    path: "/uses",
    title: "Uses & Setup",
    description: "Hardware, developer tools, and workflow configuration.",
    keywords: ["uses", "setup", "gear", "hardware", "tools", "vscode"],
    category: "main",
  },
];

export const PORTFOLIO_KNOWLEDGE: PortfolioKnowledge = {
  name: "Vantol Bennett",
  title: "Fullstack Developer & Educator",
  bio: "Over 10 years of experience in Web and Mobile development. Specialist in Vue.js, Nuxt.js, React, TypeScript, Node.js, and Python/Django.",
  skills: {
    frontend: ["Vue 3", "Nuxt 4", "TypeScript", "React", "Tailwind CSS", "Vite"],
    backend: ["Node.js", "Nitro", "Python / Django", "Firebase", "SQLite / Drizzle", "H3"],
    tools: ["Vite+", "pnpm", "Vitest", "Docker", "Vercel", "Git"],
  },
  experience: [
    {
      role: "CEO & Lead Engineer",
      company: "Mashed Potato Studios",
      period: "Present",
      description: "Building developer tooling, educational platforms, and Nuxt modules.",
    },
    {
      role: "Founder & Developer",
      company: "Zhyjenae",
      period: "Present",
      description: "Crafting software architecture and student-first learning tools.",
    },
    {
      role: "Computer Science Educator",
      company: "Eltham High School",
      period: "2010 - 2022",
      description: "Educated over 1,000 students in software development and Computer Science fundamentals.",
    },
  ],
  projects: [
    {
      name: "null-agent",
      path: "/projects/null-agent",
      tag: "CLI & Web Tool",
      description: "Minimalist AI agent terminal interface for zero-friction automation.",
    },
    {
      name: "nuxt-presence",
      path: "/projects",
      tag: "Nuxt Module",
      description: "Visitor signature wall & cryptographic build mark token generator for Nuxt apps.",
    },
    {
      name: "teacher-toolkit",
      path: "/projects/teacher-toolkit",
      tag: "Edu Package",
      description: "Utilities and helper tools designed for educator curriculum management.",
    },
    {
      name: "env-check",
      path: "/projects/env-check",
      tag: "CLI Tool",
      description: "Environment validator and schema enforcer for production deployments.",
    },
  ],
  tutorialSeries: [
    {
      title: "Nuxt Modules Tutorial Series",
      path: "/learn/nuxt-modules-core",
      description: "Mastering module anatomy, server handlers, client plugins, options, and signed build marks.",
    },
    {
      title: "Vue Vapor Deep Dive",
      path: "/learn/vue-vapor",
      description: "Exploring VDOM-less Vue rendering engine performance and compilation.",
    },
    {
      title: "Vite+ Architecture",
      path: "/learn/vite-plus-beginner",
      description: "Unified toolchain setup, testing with Vitest, and package bundling.",
    },
  ],
};
