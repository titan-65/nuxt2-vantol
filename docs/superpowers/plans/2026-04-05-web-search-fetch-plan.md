# Web Search & Fetch Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new tools (`web_search` and `web_fetch`) that give the null-agent LLM the ability to search the web via Tavily API and fetch URL content.

**Architecture:** Two new `ToolDefinition` implementations in a single file `src/tools/web.ts`, registered alongside existing built-in tools. Tavily API key resolved from env var or `~/.null-agent/credentials.json`. Auth system extended with `tavily` provider.

**Tech Stack:** TypeScript, Node.js built-in `fetch`, Tavily Search API, existing null-agent tool/auth patterns

---

### Task 1: Create `webSearchTool` and `webFetchTool`

**Files:**

- Create: `packages/null-agent/src/tools/web.ts`
- Test: `packages/null-agent/tests/web.test.ts`

- [ ] **Step 1: Write tests for `webSearchTool`**

```typescript
// packages/null-agent/tests/web.test.ts
import { describe, expect, it, vi, afterEach } from "vite-plus/test";
import { webSearchTool, webFetchTool } from "../src/tools/web.ts";

describe("webSearchTool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns error when TAVILY_API_KEY is not set", async () => {
    const originalKey = process.env.TAVILY_API_KEY;
    delete process.env.TAVILY_API_KEY;
    vi.doMock("../src/auth/index.ts", () => ({
      getCredential: vi.fn().mockResolvedValue(null),
    }));

    const result = await webSearchTool.execute({ query: "test" });
    expect(result.isError).toBe(true);
    expect(result.content).toContain("TAVILY_API_KEY");

    if (originalKey) process.env.TAVILY_API_KEY = originalKey;
  });

  it("returns error when query is missing", async () => {
    const result = await webSearchTool.execute({});
    expect(result.isError).toBe(true);
    expect(result.content).toContain("query");
  });

  it("has correct tool definition shape", () => {
    expect(webSearchTool.name).toBe("web_search");
    expect(webSearchTool.description).toBeTruthy();
    expect(webSearchTool.parameters.required).toContain("query");
    expect(webSearchTool.parameters.properties).toHaveProperty("query");
    expect(webSearchTool.parameters.properties).toHaveProperty("maxResults");
  });
});
```

- [ ] **Step 2: Write tests for `webFetchTool`**

Append to `packages/null-agent/tests/web.test.ts`:

```typescript
describe("webFetchTool", () => {
  it("returns error when url is missing", async () => {
    const result = await webFetchTool.execute({});
    expect(result.isError).toBe(true);
    expect(result.content).toContain("url");
  });

  it("returns error for invalid URL", async () => {
    const result = await webFetchTool.execute({ url: "not-a-url" });
    expect(result.isError).toBe(true);
  });

  it("has correct tool definition shape", () => {
    expect(webFetchTool.name).toBe("web_fetch");
    expect(webFetchTool.description).toBeTruthy();
    expect(webFetchTool.parameters.required).toContain("url");
    expect(webFetchTool.parameters.properties).toHaveProperty("url");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd packages/null-agent && vp test tests/web.test.ts
```

Expected: Tests fail because `src/tools/web.ts` doesn't exist yet.

- [ ] **Step 4: Implement `src/tools/web.ts`**

```typescript
// packages/null-agent/src/tools/web.ts
import type { ToolDefinition, ToolResult } from "./types.ts";
import { getCredential } from "../auth/index.ts";

const TAVILY_API_URL = "https://api.tavily.com/search";
const MAX_RESPONSE_SIZE = 1024 * 1024; // 1MB
const FETCH_TIMEOUT = 30_000; // 30s

async function getTavilyApiKey(): Promise<string | null> {
  if (process.env.TAVILY_API_KEY) return process.env.TAVILY_API_KEY;
  return getCredential("tavily");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateContent(content: string, maxBytes: number): string {
  if (new TextEncoder().encode(content).length <= maxBytes) return content;
  const bytes = new TextEncoder().encode(content);
  return new TextDecoder().decode(bytes.slice(0, maxBytes)) + "\n\n[Content truncated at 1MB]";
}

export const webSearchTool: ToolDefinition = {
  name: "web_search",
  description:
    "Search the web and return extracted content snippets. Use this to find current information, documentation, or answers to questions.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query.",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return. Default: 5. Max: 10.",
        minimum: 1,
        maximum: 10,
      },
    },
    required: ["query"],
  },
  async execute(params): Promise<ToolResult> {
    const query = params["query"] as string | undefined;
    if (!query) {
      return { content: "Error: 'query' parameter is required.", isError: true };
    }

    const apiKey = await getTavilyApiKey();
    if (!apiKey) {
      return {
        content:
          "Error: TAVILY_API_KEY not configured. Set the environment variable or run `null-agent auth tavily`.",
        isError: true,
      };
    }

    const maxResults = Math.min(Math.max(1, (params["maxResults"] as number) ?? 5), 10);

    try {
      const response = await fetch(TAVILY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: maxResults,
          include_answer: true,
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });

      if (!response.ok) {
        const error = await response.text();
        return { content: `Search failed: HTTP ${response.status} - ${error}`, isError: true };
      }

      const data = (await response.json()) as {
        answer?: string;
        results: Array<{
          title: string;
          url: string;
          content: string;
        }>;
      };

      if (!data.results || data.results.length === 0) {
        return { content: `No results found for '${query}'.`, isError: false };
      }

      const lines: string[] = [];
      if (data.answer) {
        lines.push("**Answer:**", data.answer, "");
      }

      for (const result of data.results) {
        lines.push(`## [${result.title}](${result.url})`, result.content, "");
      }

      return { content: lines.join("\n") };
    } catch (error) {
      return {
        content: `Search failed: ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      };
    }
  },
};

export const webFetchTool: ToolDefinition = {
  name: "web_fetch",
  description:
    "Fetch the content of a URL and return it as readable text. Use this to read web pages, documentation, or API responses.",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL to fetch.",
      },
    },
    required: ["url"],
  },
  async execute(params): Promise<ToolResult> {
    const url = params["url"] as string | undefined;
    if (!url) {
      return { content: "Error: 'url' parameter is required.", isError: true };
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return { content: `Error: Invalid URL '${url}'.`, isError: true };
    }

    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });

      if (!response.ok) {
        return {
          content: `Error: HTTP ${response.status} for '${url}'.`,
          isError: true,
        };
      }

      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();
      const truncated = truncateContent(text, MAX_RESPONSE_SIZE);

      if (contentType.includes("html")) {
        return { content: stripHtml(truncated) };
      }

      return { content: truncated };
    } catch (error) {
      return {
        content: `Error: Failed to fetch '${url}': ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      };
    }
  },
};
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd packages/null-agent && vp test tests/web.test.ts
```

Expected: All 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/null-agent/src/tools/web.ts packages/null-agent/tests/web.test.ts
git commit -m "feat: add web_search and web_fetch tools"
```

---

### Task 2: Register tools and export

**Files:**

- Modify: `packages/null-agent/src/tools/index.ts`
- Modify: `packages/null-agent/src/index.ts`

- [ ] **Step 1: Add to `src/tools/index.ts`**

Add the import at the top with other tool imports:

```typescript
import { webSearchTool, webFetchTool } from "./web.ts";
```

Add to named exports:

```typescript
export { webSearchTool, webFetchTool } from "./web.ts";
```

Add to `builtinTools` array (after `aiTestTool`):

```typescript
export const builtinTools: ToolDefinition[] = [
  fileReadTool,
  fileWriteTool,
  shellTool,
  ...gitTools,
  ...workflowTools,
  reviewTool,
  generateTestTool,
  runTestTool,
  fixTestTool,
  coverageTool,
  benchmarkTool,
  aiTestTool,
  webSearchTool,
  webFetchTool,
];
```

- [ ] **Step 2: Add to `src/index.ts`**

Add to the Tools section (after `builtinTools` export):

```typescript
export { webSearchTool, webFetchTool } from "./tools/web.ts";
```

- [ ] **Step 3: Run full test suite**

```bash
cd packages/null-agent && vp test
```

Expected: All tests pass (existing + new web tests).

- [ ] **Step 4: Verify exports work**

```bash
cd packages/null-agent && vp build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/null-agent/src/tools/index.ts packages/null-agent/src/index.ts
git commit -m "feat: export web tools in tool registry and main entry"
```

---

### Task 3: Add Tavily to auth system

**Files:**

- Modify: `packages/null-agent/src/auth/index.ts`

- [ ] **Step 1: Add Tavily to `AUTH_PROMPTS`**

In `packages/null-agent/src/auth/index.ts`, add to the `AUTH_PROMPTS` array (after the openrouter entry):

```typescript
{
  provider: "tavily",
  displayName: "Tavily",
  envKey: "TAVILY_API_KEY",
  instructions: "Enter your Tavily API key",
  getKeyUrl: "https://tavily.com/",
},
```

- [ ] **Step 2: Verify auth commands work**

```bash
cd packages/null-agent && vp build && null-agent auth status
```

Expected: Tavily appears in the status list alongside OpenAI, Anthropic, Gemini, OpenRouter.

- [ ] **Step 3: Commit**

```bash
git add packages/null-agent/src/auth/index.ts
git commit -m "feat: add Tavily API key to auth system"
```

---

### Task 4: Update README documentation

**Files:**

- Modify: `packages/null-agent/README.md`

- [ ] **Step 1: Add Tavily to the providers table**

Find the providers table (around line 95) and add Tavily row:

```markdown
| Provider      | Env Variable         | Default Model              | Free Models                     |
| ------------- | -------------------- | -------------------------- | ------------------------------- |
| OpenAI        | `OPENAI_API_KEY`     | `gpt-4o`                   | —                               |
| Anthropic     | `ANTHROPIC_API_KEY`  | `claude-sonnet-4-20250514` | —                               |
| Google Gemini | `GEMINI_API_KEY`     | `gemini-2.0-flash`         | `gemini-2.0-flash` (free tier)  |
| OpenRouter    | `OPENROUTER_API_KEY` | `google/gemini-2.0-flash`  | `gemini-2.0-flash`, `llama-3.1` |
| Tavily        | `TAVILY_API_KEY`     | —                          | 1000 searches/month (free tier) |
```

- [ ] **Step 2: Add web tools to the tools section**

After the Testing Tools table, add a new section:

```markdown
### Web Tools

| Tool            | Name         | Description                        |
| --------------- | ------------ | ---------------------------------- |
| `webSearchTool` | `web_search` | Search the web via Tavily API      |
| `webFetchTool`  | `web_fetch`  | Fetch URL content as readable text |

Get a free Tavily API key: https://tavily.com/
```

- [ ] **Step 3: Update the tools count badge**

Find the tools badge (around line 9) and update from `26` to `28`:

```markdown
<img src="https://img.shields.io/badge/tools-28%20built--in-orange?style=for-the-badge" alt="Tools" />
```

- [ ] **Step 4: Add Tavily to auth section**

In the auth section, add Tavily to the environment variables list:

```markdown
export TAVILY_API_KEY='tvly-...'
```

And update the auth command examples to mention tavily:

```markdown
null-agent auth tavily # Configure Tavily API key
```

- [ ] **Step 5: Commit**

```bash
git add packages/null-agent/README.md
git commit -m "docs: add web tools and Tavily to README"
```

---

### Task 5: Add tests for Tavily API key resolution

**Files:**

- Modify: `packages/null-agent/tests/web.test.ts`

- [ ] **Step 1: Add credential resolution tests**

Append to `packages/null-agent/tests/web.test.ts`:

```typescript
describe("Tavily API key resolution", () => {
  it("reads TAVILY_API_KEY from environment variable", async () => {
    process.env.TAVILY_API_KEY = "test-env-key";
    const result = await webSearchTool.execute({ query: "test" });
    // Should not return "not configured" error (will fail with invalid key, but that's fine)
    expect(result.content).not.toContain("TAVILY_API_KEY not configured");
    delete process.env.TAVILY_API_KEY;
  });
});
```

- [ ] **Step 2: Run full test suite**

```bash
cd packages/null-agent && vp test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/null-agent/tests/web.test.ts
git commit -m "test: add Tavily API key resolution tests"
```
