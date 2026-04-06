# UnJS Packages Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate 6 UnJS packages into null-agent to improve config loading, HTTP handling, file watching, logging, storage, and dev experience.

**Architecture:** Each package replaces a hand-rolled subsystem with its battle-tested UnJS equivalent. Changes are independent — each can be built, tested, and committed separately.

**Tech Stack:** TypeScript, ESM, Node.js >=20, Vite+ (`vp`), confbox, ofetch, perfect-debounce, c12, consola, unstorage

---

### Task 1: confbox — YAML/TOML config support

**Files:**
- Modify: `packages/null-agent/src/config/index.ts`
- Modify: `packages/null-agent/src/agent/personality.ts`

- [ ] **Step 1: Install confbox**

```bash
cd packages/null-agent && vp add confbox
```

- [ ] **Step 2: Replace JSON.parse in `src/config/index.ts`**

Change `loadFromFile` to detect format by extension:

```typescript
import { readFileSync } from "node:fs";
import { parseJSONC, parseYAML, parseTOML, parseJSON5 } from "confbox";
import { extname } from "node:path";

async function loadFromFile(path: string): Promise<Partial<NullAgentConfig> | null> {
  try {
    const data = await readFile(path, "utf-8");
    const ext = extname(path);

    switch (ext) {
      case ".yaml":
      case ".yml":
        return parseYAML<Partial<NullAgentConfig>>(data);
      case ".toml":
        return parseTOML<Partial<NullAgentConfig>>(data);
      case ".jsonc":
        return parseJSONC<Partial<NullAgentConfig>>(data);
      case ".json5":
        return parseJSON5<Partial<NullAgentConfig>>(data);
      default:
        return JSON.parse(data) as Partial<NullAgentConfig>;
    }
  } catch {
    return null;
  }
}
```

Update config file resolution to try multiple extensions. Change `loadConfig` to search for config files in order: `.json`, `.yaml`, `.yml`, `.toml`, `.jsonc`, `.json5`:

```typescript
const CONFIG_EXTENSIONS = [".json", ".yaml", ".yml", ".toml", ".jsonc", ".json5"];

async function findConfigFile(dir: string, baseName: string): Promise<string | null> {
  for (const ext of CONFIG_EXTENSIONS) {
    const candidate = join(dir, `${baseName}${ext}`);
    try {
      await readFile(candidate, "utf-8");
      return candidate;
    } catch {
      // File doesn't exist, try next
    }
  }
  return null;
}
```

Update the `loadConfig` function to use `findConfigFile`:

```typescript
export async function loadConfig(projectDir?: string): Promise<NullAgentConfig> {
  const sources: ConfigSource[] = [];
  sources.push({ name: "defaults", priority: 0, config: DEFAULT_CONFIG });

  const envConfig = loadFromEnv();
  if (envConfig) {
    sources.push({ name: "env", priority: 1, config: envConfig });
  }

  const userConfigFile = await findConfigFile(USER_CONFIG_DIR, "config");
  if (userConfigFile) {
    const userConfig = await loadFromFile(userConfigFile);
    if (userConfig) {
      sources.push({ name: "user", priority: 2, config: userConfig });
    }
  }

  if (projectDir) {
    const projectConfigFile = await findConfigFile(projectDir, ".null-agent");
    if (projectConfigFile) {
      const projectConfig = await loadFromFile(projectConfigFile);
      if (projectConfig) {
        sources.push({ name: "project", priority: 3, config: projectConfig });
      }
    }
  }

  return mergeConfigs(sources);
}
```

- [ ] **Step 3: Replace JSON.parse in `src/agent/personality.ts`**

Update `loadConfig` in personality.ts to use confbox:

```typescript
import { parseJSONC, parseYAML, parseTOML, parseJSON5 } from "confbox";
import { extname } from "node:path";

export async function loadConfig(): Promise<NullAgentConfig> {
  // Try JSON first, then YAML, then TOML
  const configDir = join(homedir(), ".null-agent");
  const candidates = [
    { path: join(configDir, "config.json"), parse: (d: string) => JSON.parse(d) },
    { path: join(configDir, "config.yaml"), parse: (d: string) => parseYAML(d) },
    { path: join(configDir, "config.yml"), parse: (d: string) => parseYAML(d) },
    { path: join(configDir, "config.toml"), parse: (d: string) => parseTOML(d) },
  ];

  for (const candidate of candidates) {
    try {
      const data = await readFile(candidate.path, "utf-8");
      const parsed = candidate.parse(data) as Partial<NullAgentConfig>;
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        personality: {
          ...DEFAULT_CONFIG.personality,
          ...parsed.personality,
        },
      };
    } catch {
      continue;
    }
  }

  return { ...DEFAULT_CONFIG };
}
```

- [ ] **Step 4: Run tests**

```bash
cd packages/null-agent && vp test
```

- [ ] **Step 5: Build**

```bash
cd packages/null-agent && vp pack
```

- [ ] **Step 6: Commit**

```bash
git add packages/null-agent/src/config/index.ts packages/null-agent/src/agent/personality.ts packages/null-agent/package.json
git -C packages/null-agent commit -m "feat: add YAML/TOML config support via confbox"
```

---

### Task 2: ofetch — Replace raw fetch in web tools and providers

**Files:**
- Modify: `packages/null-agent/src/tools/web.ts`
- Modify: `packages/null-agent/src/providers/openai.ts`
- Modify: `packages/null-agent/src/providers/anthropic.ts`

- [ ] **Step 1: Install ofetch**

```bash
cd packages/null-agent && vp add ofetch
```

- [ ] **Step 2: Replace fetch in `src/tools/web.ts`**

Replace `fetch()` with `$fetch` for web_search:

```typescript
import { $fetch } from "ofetch";

// In webSearchTool.execute:
const data = await $fetch<TavilyResponse>(TAVILY_API_URL, {
  method: "POST",
  body: {
    api_key: apiKey,
    query,
    max_results: maxResults,
    include_answer: true,
  },
  timeout: FETCH_TIMEOUT,
  retry: 1,
});
```

Replace `fetch()` with `$fetch` for web_fetch:

```typescript
// In webFetchTool.execute:
const text = await $fetch<string>(parsedUrl.toString(), {
  timeout: FETCH_TIMEOUT,
  responseType: "text",
  retry: 1,
});
```

Remove the manual `AbortSignal.timeout()` calls since ofetch handles timeouts natively.

- [ ] **Step 3: Replace fetch in `src/providers/openai.ts`**

Replace `fetch()` call (line 30-37) with `ofetch` for better error messages:

```typescript
import { ofetch } from "ofetch";

// In chat():
const response = await ofetch(this.baseUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${this.apiKey}`,
  },
  body,
  responseType: "stream",
  retry: 2,
  retryDelay: 1000,
  onRequestError: ({ error }) => {
    throw new Error(`OpenAI API request failed: ${error.message}`);
  },
  onResponseError: ({ response }) => {
    throw new Error(`OpenAI API error (${response.status}): ${response.statusText}`);
  },
});
```

Note: for streaming, keep using the response body reader approach but with ofetch's `responseType: "stream"`.

- [ ] **Step 4: Replace fetch in `src/providers/anthropic.ts`**

Same pattern as OpenAI — replace `fetch()` with `ofetch`, add retry logic.

- [ ] **Step 5: Run tests**

```bash
cd packages/null-agent && vp test
```

- [ ] **Step 6: Build**

```bash
cd packages/null-agent && vp pack
```

- [ ] **Step 7: Commit**

```bash
git -C packages/null-agent add -A && git -C packages/null-agent commit -m "feat: replace raw fetch with ofetch for better error handling"
```

---

### Task 3: perfect-debounce — Replace hand-rolled debouncing in FileWatcher

**Files:**
- Modify: `packages/null-agent/src/awareness/watcher.ts`

- [ ] **Step 1: Install perfect-debounce**

```bash
cd packages/null-agent && vp add perfect-debounce
```

- [ ] **Step 2: Replace manual debounce with `debounce()`**

Replace the `handleEvent` method to use `debounce`:

```typescript
import { debounce } from "perfect-debounce";

const DEBOUNCE_MS = 500;

export class FileWatcher {
  private projectDir: string;
  private watcher: FSWatcher | null = null;
  private callback: ((event: AwarenessEvent) => void) | null = null;
  private pendingEvents: Map<string, AwarenessEvent> = new Map();

  // Replaces manual setTimeout/clearTimeout logic
  private flushDebounced = debounce(() => {
    this.flushEvents();
  }, DEBOUNCE_MS);

  // ... constructor unchanged ...

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    // No manual timer cleanup needed
  }

  private handleEvent(eventType: string, filename: string): void {
    const relPath = relative(this.projectDir, join(this.projectDir, filename));
    let type: AwarenessEvent["type"];
    if (eventType === "rename") {
      try {
        statSync(join(this.projectDir, filename));
        type = "file:create";
      } catch {
        type = "file:delete";
      }
    } else {
      type = "file:modify";
    }

    this.pendingEvents.set(relPath, {
      type,
      message: relPath,
      timestamp: Date.now(),
    });

    this.flushDebounced();
  }

  // flushEvents() stays the same
}
```

Remove `private debounceTimer: ReturnType<typeof setTimeout> | null = null;` and the manual timer cleanup in `stop()`.

- [ ] **Step 3: Run tests**

```bash
cd packages/null-agent && vp test
```

- [ ] **Step 4: Build**

```bash
cd packages/null-agent && vp pack
```

- [ ] **Step 5: Commit**

```bash
git -C packages/null-agent add -A && git -C packages/null-agent commit -m "feat: replace manual debounce with perfect-debounce"
```

---

### Task 4: c12 — Replace config loading system

**Files:**
- Rewrite: `packages/null-agent/src/config/index.ts`

- [ ] **Step 1: Install c12 and defu**

```bash
cd packages/null-agent && vp add c12 defu
```

- [ ] **Step 2: Rewrite config loading with `loadConfig` from c12**

Replace the entire `src/config/index.ts`:

```typescript
import { loadConfig as c12LoadConfig } from "c12";
import { defu } from "defu";

export type Tone = "professional" | "casual" | "concise";
export type Verbosity = "minimal" | "balanced" | "detailed";
export type Proactivity = "passive" | "balanced" | "active";
export type PermissionMode = "auto" | "confirm" | "plan";

export interface PersonalityConfig {
  tone: Tone;
  verbosity: Verbosity;
  proactivity: Proactivity;
}

export interface PermissionConfig {
  mode: PermissionMode;
  allowWrite: boolean;
  allowShell: boolean;
  allowGit: boolean;
  denyPatterns: string[];
}

export interface ProviderConfig {
  default?: string;
  model?: string;
  apiKey?: string;
}

export interface NullAgentConfig {
  personality: PersonalityConfig;
  permissions: PermissionConfig;
  provider: ProviderConfig;
  plugins: string[];
}

const DEFAULT_CONFIG: NullAgentConfig = {
  personality: {
    tone: "casual",
    verbosity: "balanced",
    proactivity: "balanced",
  },
  permissions: {
    mode: "auto",
    allowWrite: true,
    allowShell: true,
    allowGit: true,
    denyPatterns: [],
  },
  provider: {},
  plugins: [],
};

export async function loadConfig(projectDir?: string): Promise<NullAgentConfig> {
  // Load user-level config
  const { config: userConfig } = await c12LoadConfig<Partial<NullAgentConfig>>({
    name: "config",
    cwd: `${process.env.HOME}/.null-agent`,
    dotenv: true,
    defaults: DEFAULT_CONFIG,
  });

  // Load project-level config (higher priority)
  if (projectDir) {
    const { config: projectConfig } = await c12LoadConfig<Partial<NullAgentConfig>>({
      name: ".null-agent",
      cwd: projectDir,
      dotenv: true,
      defaults: DEFAULT_CONFIG,
    });

    // Merge with defu: project config overrides user config, user config overrides defaults
    return defu(projectConfig, userConfig, DEFAULT_CONFIG) as NullAgentConfig;
  }

  return defu(userConfig, DEFAULT_CONFIG) as NullAgentConfig;
}

export { DEFAULT_CONFIG };
```

- [ ] **Step 3: Update all imports**

Since `loadConfig` is re-exported from `src/index.ts`, check that no imports break. The function signature stays the same: `loadConfig(projectDir?: string): Promise<NullAgentConfig>`.

- [ ] **Step 4: Run tests**

```bash
cd packages/null-agent && vp test
```

- [ ] **Step 5: Build**

```bash
cd packages/null-agent && vp pack
```

- [ ] **Step 6: Commit**

```bash
git -C packages/null-agent add -A && git -C packages/null-agent commit -m "feat: replace config system with c12 and defu"
```

---

### Task 5: consola — Replace console.log calls

**Files:**
- Create: `packages/null-agent/src/lib/logger.ts`
- Modify: `packages/null-agent/src/cli/index.ts`
- Modify: `packages/null-agent/src/cli/repl.ts`
- Modify: `packages/null-agent/src/cli/output.ts`
- Modify: `packages/null-agent/src/auth/index.ts`
- Modify: `packages/null-agent/src/server/index.ts`

- [ ] **Step 1: Install consola**

```bash
cd packages/null-agent && vp add consola
```

- [ ] **Step 2: Create logger module**

```typescript
// packages/null-agent/src/lib/logger.ts
import { createConsola } from "consola";

export const logger = createConsola({
  level: 3, // info by default
  formatOptions: {
    colors: true,
    compact: false,
  },
});

export default logger;
```

- [ ] **Step 3: Replace `console.log`/`console.error` in `src/auth/index.ts`**

Replace all `console.log` and `console.error` calls:

```typescript
import { logger } from "../lib/logger.ts";

// In interactiveAuth():
logger.info("\n  null-agent — Configure API Keys\n");
// ... replace all console.log with logger.info, logger.success, logger.warn
logger.success(`  ✓ Saved ${p.displayName} key`);
logger.warn(`  Skipped`);

// In printAuthStatus():
logger.info("\n  null-agent — API Key Status\n");
```

- [ ] **Step 4: Replace `console.log`/`console.error` in `src/cli/output.ts`**

```typescript
import { logger } from "../lib/logger.ts";

// Replace console.log calls with logger.info
```

- [ ] **Step 5: Replace `console.log`/`console.error` in `src/cli/repl.ts`**

```typescript
import { logger } from "../lib/logger.ts";

// Replace console.log with logger.info
```

- [ ] **Step 6: Replace `console.log` in `src/server/index.ts`**

```typescript
import { logger } from "../lib/logger.ts";

// Replace console.log with logger.info
logger.info(`  null-agent server on http://${host}:${port}`);
```

- [ ] **Step 7: Run tests**

```bash
cd packages/null-agent && vp test
```

- [ ] **Step 8: Build**

```bash
cd packages/null-agent && vp pack
```

- [ ] **Step 9: Commit**

```bash
git -C packages/null-agent add -A && git -C packages/null-agent commit -m "feat: replace console.log with consola logger"
```

---

### Task 6: unstorage — Replace MemoryStore

**Files:**
- Rewrite: `packages/null-agent/src/memory/store.ts`
- Modify: `packages/null-agent/src/memory/index.ts`

- [ ] **Step 1: Install unstorage and unstorage fs driver**

```bash
cd packages/null-agent && vp add unstorage
```

- [ ] **Step 2: Rewrite MemoryStore with unstorage**

Replace `src/memory/store.ts`:

```typescript
import { createStorage, type Storage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { Conversation, ConversationSummary } from "./types.ts";
import type { Message } from "../providers/types.ts";

const MEMORY_DIR = join(homedir(), ".null-agent", "memory");

export class MemoryStore {
  private storage: Storage;
  private memoryDir: string;

  constructor(baseDir?: string) {
    this.memoryDir = baseDir ?? MEMORY_DIR;
    this.storage = createStorage({
      driver: fsDriver({
        base: this.memoryDir,
        ignore: [".gitkeep"],
      }),
    });
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    await this.storage.setItem(`${conversation.id}.json`, JSON.stringify(conversation, null, 2));
  }

  async loadConversation(id: string): Promise<Conversation | null> {
    const data = await this.storage.getItem<string>(`${id}.json`);
    if (!data) return null;
    return JSON.parse(data) as Conversation;
  }

  async listConversations(limit = 20): Promise<ConversationSummary[]> {
    const keys = await this.storage.getKeys();
    const jsonKeys = keys.filter((k) => k.endsWith(".json"));

    const summaries: ConversationSummary[] = [];

    for (const key of jsonKeys) {
      try {
        const data = await this.storage.getItem<string>(key);
        if (!data) continue;
        const conv = JSON.parse(data) as Conversation;
        summaries.push({
          id: conv.id,
          title: conv.title,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.metadata.messageCount,
          summary: conv.metadata.summary,
        });
      } catch {
        // Skip corrupted items
      }
    }

    summaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return summaries.slice(0, limit);
  }

  async getLatestConversation(projectDir?: string): Promise<Conversation | null> {
    const summaries = await this.listConversations(50);
    if (summaries.length === 0) return null;

    if (projectDir) {
      for (const summary of summaries) {
        const conv = await this.loadConversation(summary.id);
        if (conv && conv.metadata.projectDir === projectDir) {
          return conv;
        }
      }
    }

    return this.loadConversation(summaries[0]!.id);
  }

  async deleteConversation(id: string): Promise<boolean> {
    try {
      await this.storage.removeItem(`${id}.json`);
      return true;
    } catch {
      return false;
    }
  }
}

export function createConversation(
  projectDir: string,
  projectName: string,
  provider: string,
  model: string,
): Conversation {
  const now = new Date().toISOString();
  const id = generateId();
  return {
    id,
    title: "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
    metadata: {
      projectDir,
      projectName,
      provider,
      model,
      messageCount: 0,
    },
  };
}

export function updateConversation(conversation: Conversation, messages: Message[]): Conversation {
  const title = generateTitle(messages);
  const summary = generateSummary(messages);
  return {
    ...conversation,
    title,
    updatedAt: new Date().toISOString(),
    messages,
    metadata: {
      ...conversation.metadata,
      messageCount: messages.length,
      summary,
    },
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateTitle(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New conversation";
  const text = firstUser.content.trim();
  if (text.length <= 50) return text;
  return text.slice(0, 47) + "...";
}

function generateSummary(messages: Message[]): string {
  if (messages.length < 2) return "";
  const topics = new Set<string>();
  for (const msg of messages) {
    if (msg.role === "user") {
      const words = msg.content.toLowerCase().split(/\s+/);
      for (const w of words) {
        if (w.length > 4 && !commonWords.has(w)) {
          topics.add(w);
        }
      }
    }
  }
  return Array.from(topics).slice(0, 5).join(", ");
}

const commonWords = new Set([
  "about", "after", "again", "also", "been", "being", "could", "does", "each",
  "from", "have", "help", "here", "just", "like", "make", "more", "most", "much",
  "only", "other", "over", "should", "some", "such", "than", "that", "their", "them",
  "then", "there", "these", "they", "this", "those", "very", "what", "when", "which",
  "while", "will", "with", "would", "your", "file", "files", "code", "what's", "tell",
  "show", "give",
]);
```

- [ ] **Step 3: Run tests**

```bash
cd packages/null-agent && vp test
```

- [ ] **Step 4: Build**

```bash
cd packages/null-agent && vp pack
```

- [ ] **Step 5: Commit**

```bash
git -C packages/null-agent add -A && git -C packages/null-agent commit -m "feat: replace MemoryStore with unstorage"
```
