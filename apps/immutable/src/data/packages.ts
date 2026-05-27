export interface PackageInfo {
  name: string;
  npmName: string;
  description: string;
  version: string;
  installCmd: string;
  githubUrl: string;
  npmUrl: string;
  isMain?: boolean;
  features?: string[];
}

export const packages: PackageInfo[] = [
  {
    name: "null-agent",
    npmName: "null-agent",
    description:
      "Interactive coding assistant library with multi-provider LLM support, proactive engine, user model, and 49 built-in tools.",
    version: "0.6.2",
    installCmd: "npm install null-agent",
    githubUrl: "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/null-agent",
    npmUrl: "https://www.npmjs.com/package/null-agent",
    isMain: true,
    features: [
      "Proactive Engine — reaches out before you ask",
      "User Model — learns your habits, preferences, goals",
      "49 Built-in tools (file, shell, git, review, testing, web)",
      "Multi-provider LLM (OpenAI, Anthropic, Gemini, OpenRouter)",
      "Google Calendar integration with OAuth",
      "TUI, REPL, HTTP server, CLI",
      "Privacy Mode — redacts personal data from LLM",
      "Developer accountability & goal tracking",
    ],
  },
  {
    name: "env-check",
    npmName: "env-check",
    description:
      "Validates environment variables against a typed schema at startup with clear error messages.",
    version: "0.0.0",
    installCmd: "npm install env-check",
    githubUrl: "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/env-check",
    npmUrl: "https://www.npmjs.com/package/env-check",
  },
  {
    name: "teacher-toolkit",
    npmName: "teacher-toolkit",
    description:
      "Grade calculation utilities — letter grades, GPA conversion, weighted averages, score curving, and class statistics.",
    version: "0.0.0",
    installCmd: "npm install teacher-toolkit",
    githubUrl:
      "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/teacher-toolkit",
    npmUrl: "https://www.npmjs.com/package/teacher-toolkit",
  },
  {
    name: "vercel-deploy-hooks",
    npmName: "vercel-deploy-hooks",
    description:
      "Trigger Vercel deployments programmatically via deploy hooks. Works as both a library and CLI.",
    version: "0.0.0",
    installCmd: "npm install vercel-deploy-hooks",
    githubUrl:
      "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/vercel-deploy-hooks",
    npmUrl: "https://www.npmjs.com/package/vercel-deploy-hooks",
  },
];

export function getPackageBySlug(slug: string): PackageInfo | undefined {
  return packages.find((p) => p.name === slug);
}
