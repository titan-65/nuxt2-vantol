# null-agent Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the full-viewport xterm.js terminal into a full product landing page with terminal demo card, matching the blog's dark + gold design language.

**Architecture:** Add Tailwind CSS v4 via `@tailwindcss/vite`, rewrite `index.html` as a landing page with nav/hero/terminal/features/how-it-works/FAQ/footer sections. Terminal logic (`src/main.ts`) stays largely unchanged but targets `#terminal` inside a styled card instead of full viewport.

**Tech Stack:** Vite + TypeScript + xterm.js + Tailwind CSS v4

---

## File Structure

| File                             | Action | Responsibility                                                       |
| -------------------------------- | ------ | -------------------------------------------------------------------- |
| `apps/null-agent/package.json`   | Modify | Add `tailwindcss` + `@tailwindcss/vite` devDeps                      |
| `apps/null-agent/vite.config.ts` | Create | Vite config with `@tailwindcss/vite` plugin                          |
| `apps/null-agent/src/style.css`  | Modify | Tailwind import + xterm overrides + design tokens                    |
| `apps/null-agent/index.html`     | Modify | Full landing page HTML with all sections                             |
| `apps/null-agent/src/main.ts`    | Modify | Keep terminal logic, retarget `#terminal`, add landing interactivity |

---

### Task 1: Add Tailwind CSS v4 dependencies + vite config

**Files:**

- Modify: `apps/null-agent/package.json`
- Create: `apps/null-agent/vite.config.ts`

- [ ] **Step 1: Add tailwindcss and @tailwindcss/vite to package.json**

```json
{
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "tailwindcss": "^4.1.18",
    "typescript": "~6.0.2",
    "vite": "^6.3.0",
    "vite-plus": "^0.1.14"
  }
}
```

Edit `apps/null-agent/package.json`, adding the two new entries under `devDependencies`.

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

- [ ] **Step 3: Run vp install to install new deps**

Run: `vp install` (from `apps/null-agent/`)
Expected: installs `tailwindcss` and `@tailwindcss/vite` successfully

---

### Task 2: Rewrite style.css with Tailwind + design tokens

**Files:**

- Modify: `apps/null-agent/src/style.css`

- [ ] **Step 1: Replace style.css content**

```css
@import "tailwindcss";

@theme {
  --color-surface: #111;
  --color-accent: #f5c542;
  --color-muted: #a1a1aa;
  --color-dark: #0a0a0a;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background: #0a0a0a;
  color: #fafafa;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#terminal {
  width: 100%;
  height: 100%;
  min-height: 360px;
}

.xterm {
  padding: 8px;
  height: 100%;
}

.xterm-viewport {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

details > summary {
  list-style: none;
}

details > summary::-webkit-details-marker {
  display: none;
}
```

---

### Task 3: Rewrite index.html as landing page

**Files:**

- Modify: `apps/null-agent/index.html`

- [ ] **Step 1: Write the full landing page HTML**

```html
<!doctype html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>null-agent · AI agent terminal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="bg-dark text-[#fafafa]">
    <!-- Sticky Nav -->
    <header class="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" class="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="text-[#f5c542]"
          >
            <path
              d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
              fill="currentColor"
            />
          </svg>
          <span class="font-semibold text-sm tracking-tight">null-agent</span>
        </a>
        <nav class="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-zinc-400 hover:text-white transition-colors"
            >GitHub</a
          >
          <a href="#" class="text-sm text-zinc-400 hover:text-white transition-colors">Docs</a>
        </nav>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <section class="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div
          class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f5c542]/10 border border-[#f5c542]/20 mb-6"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 48 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="text-[#f5c542]"
          >
            <path
              d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1 class="text-5xl md:text-6xl font-semibold tracking-tight">null-agent</h1>
        <p class="text-lg md:text-xl text-zinc-400 mt-4 max-w-2xl mx-auto">
          Your AI agent, now in the browser.
        </p>
        <p class="text-sm text-zinc-500 mt-2">
          Connect to your null-agent server from anywhere, in a real terminal.
        </p>
        <div class="flex items-center justify-center gap-4 mt-8">
          <a
            href="#terminal-section"
            class="inline-flex items-center gap-2 bg-[#f5c542] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#e0b13a] transition-colors text-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Connect to Server
          </a>
          <a
            href="#"
            class="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors text-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Read the Docs
          </a>
        </div>
      </section>

      <!-- Terminal Demo -->
      <section id="terminal-section" class="max-w-4xl mx-auto px-6 pb-24">
        <div class="bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <!-- Terminal title bar -->
          <div class="bg-black/40 border-b border-white/10 px-4 py-2.5 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-green-500/80"></span>
            <span class="text-xs text-zinc-400 font-mono ml-2">null-agent terminal</span>
          </div>
          <!-- Terminal container -->
          <div id="terminal" class="h-[420px]"></div>
        </div>
      </section>

      <!-- Features -->
      <section class="max-w-5xl mx-auto px-6 pb-24">
        <div class="text-center mb-12">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">FEATURES</p>
          <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Everything you need</h2>
          <p class="text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
            Real-time AI agent interaction in your browser, powered by null-agent.
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div
            class="bg-[#111] border border-white/10 rounded-xl p-6 group hover:border-white/20 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-[#f5c542]/10 flex items-center justify-center mb-4 group-hover:text-[#f5c542] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-[#f5c542]"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-2">Real-time SSE</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Stream AI responses character by character with zero latency via Server-Sent Events.
            </p>
          </div>
          <div
            class="bg-[#111] border border-white/10 rounded-xl p-6 group hover:border-white/20 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-[#f5c542]/10 flex items-center justify-center mb-4 group-hover:text-[#f5c542] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-[#f5c542]"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-2">Multi-Provider</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Works with OpenAI, Anthropic, Google Gemini, Groq, and more — swap providers freely.
            </p>
          </div>
          <div
            class="bg-[#111] border border-white/10 rounded-xl p-6 group hover:border-white/20 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-[#f5c542]/10 flex items-center justify-center mb-4 group-hover:text-[#f5c542] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-[#f5c542]"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <path d="M6 6h.01M6 18h.01" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-2">49 Built-in Tools</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              File operations, code execution, web search, and more — extensible tool system.
            </p>
          </div>
          <div
            class="bg-[#111] border border-white/10 rounded-xl p-6 group hover:border-white/20 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-[#f5c542]/10 flex items-center justify-center mb-4 group-hover:text-[#f5c542] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-[#f5c542]"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-2">Conversation Memory</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Full history tracking with the
              <code class="text-[#f5c542] text-xs font-mono">/history</code> command — never lose
              context.
            </p>
          </div>
          <div
            class="bg-[#111] border border-white/10 rounded-xl p-6 group hover:border-white/20 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-[#f5c542]/10 flex items-center justify-center mb-4 group-hover:text-[#f5c542] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-[#f5c542]"
              >
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-2">Clean Terminal UI</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Syntax-highlighted output, tool call formatting, error display — built with xterm.js.
            </p>
          </div>
          <div
            class="bg-[#111] border border-white/10 rounded-xl p-6 group hover:border-white/20 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-[#f5c542]/10 flex items-center justify-center mb-4 group-hover:text-[#f5c542] transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-[#f5c542]"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold mb-2">Quick Connect</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Connect to any null-agent server instantly with
              <code class="text-[#f5c542] text-xs font-mono">/connect &lt;url&gt;</code>
            </p>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="max-w-4xl mx-auto px-6 pb-24">
        <div class="text-center mb-12">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
            HOW IT WORKS
          </p>
          <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">
            Get started in three steps
          </h2>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="w-12 h-12 rounded-full bg-[#f5c542]/10 border border-[#f5c542]/30 flex items-center justify-center mx-auto"
            >
              <span class="text-[#f5c542] font-bold text-lg">1</span>
            </div>
            <h3 class="font-semibold mt-4 mb-2">Start your server</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Run <code class="text-[#f5c542] text-xs font-mono">null-agent serve</code> to start
              the HTTP API server on your machine.
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 rounded-full bg-[#f5c542]/10 border border-[#f5c542]/30 flex items-center justify-center mx-auto"
            >
              <span class="text-[#f5c542] font-bold text-lg">2</span>
            </div>
            <h3 class="font-semibold mt-4 mb-2">Open the web terminal</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Connect your browser to the web terminal — it auto-connects to your server.
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 rounded-full bg-[#f5c542]/10 border border-[#f5c542]/30 flex items-center justify-center mx-auto"
            >
              <span class="text-[#f5c542] font-bold text-lg">3</span>
            </div>
            <h3 class="font-semibold mt-4 mb-2">Chat with your agent</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Type any message and get real-time AI responses with tool execution support.
            </p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="max-w-3xl mx-auto px-6 pb-24">
        <div class="text-center mb-12">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">FAQ</p>
          <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">Common questions</h2>
        </div>
        <div class="space-y-0">
          <details class="border-b border-white/10 py-4 group open:border-[#f5c542]/30">
            <summary class="flex items-center justify-between text-sm font-medium cursor-pointer">
              What is null-agent?
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-zinc-500 group-open:rotate-180 transition-transform"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div class="text-sm text-zinc-400 pt-3 leading-relaxed">
              null-agent is an interactive coding assistant library with multi-provider LLM support,
              a rich terminal UI, tool system, conversation memory, and multi-agent orchestration.
            </div>
          </details>
          <details class="border-b border-white/10 py-4 group open:border-[#f5c542]/30">
            <summary class="flex items-center justify-between text-sm font-medium cursor-pointer">
              How do I install it?
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-zinc-500 group-open:rotate-180 transition-transform"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div class="text-sm text-zinc-400 pt-3 leading-relaxed">
              <code class="text-[#f5c542] text-xs font-mono">npm install null-agent</code> for the
              library, or
              <code class="text-[#f5c542] text-xs font-mono">npm install -g null-agent</code> for
              the CLI.
            </div>
          </details>
          <details class="border-b border-white/10 py-4 group open:border-[#f5c542]/30">
            <summary class="flex items-center justify-between text-sm font-medium cursor-pointer">
              What LLM providers are supported?
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-zinc-500 group-open:rotate-180 transition-transform"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div class="text-sm text-zinc-400 pt-3 leading-relaxed">
              OpenAI, Anthropic, Google Gemini, Groq, and more. Configure any provider with
              <code class="text-[#f5c542] text-xs font-mono">null-agent auth</code>.
            </div>
          </details>
          <details class="border-b border-white/10 py-4 group open:border-[#f5c542]/30">
            <summary class="flex items-center justify-between text-sm font-medium cursor-pointer">
              Can I self-host?
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-zinc-500 group-open:rotate-180 transition-transform"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div class="text-sm text-zinc-400 pt-3 leading-relaxed">
              Yes. Run <code class="text-[#f5c542] text-xs font-mono">null-agent serve</code> to
              start the server, then expose the port to connect from anywhere.
            </div>
          </details>
          <details class="border-b border-white/10 py-4 group open:border-[#f5c542]/30">
            <summary class="flex items-center justify-between text-sm font-medium cursor-pointer">
              Is there a CLI?
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-zinc-500 group-open:rotate-180 transition-transform"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div class="text-sm text-zinc-400 pt-3 leading-relaxed">
              Yes — null-agent offers four interfaces: library, REPL, TUI, and HTTP server. Use
              whichever fits your workflow best.
            </div>
          </details>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 bg-[#0a0a0a] py-8">
      <div class="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <p class="text-sm text-zinc-500">null-agent &mdash; MIT License</p>
        <div class="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-zinc-400 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
          </a>
          <a
            href="#"
            class="text-zinc-400 hover:text-white transition-colors"
            aria-label="Documentation"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>

    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

---

### Task 4: Update main.ts — add landing interactivity, retarget terminal

**Files:**

- Modify: `apps/null-agent/src/main.ts`

- [ ] **Step 1: Add landing page interactivity to main.ts**

The terminal logic stays the same. Changes needed:

1. Import `./style.css` stays
2. Terminal container target changes from `document.getElementById("terminal")!` — already correct since we kept `id="terminal"`, but the terminal is now inside a `.bg-[#111]` card instead of full viewport
3. Add smooth scroll for hero CTA
4. Add FAQ accordion toggle (CSS handles the rotation via `group-open:rotate-180`)

The terminal already targets `#terminal` and xterm fitAddon handles the resize — no changes needed to terminal logic. Just verify the terminal element exists:

Add at the end of `main.ts` (before the health check call):

```typescript
// Landing page: hero CTA smooth scroll
document.querySelector('a[href="#terminal-section"]')?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("terminal-section")?.scrollIntoView({ behavior: "smooth" });
});
```

- [ ] **Step 2: Verify the complete main.ts works**

The file imports, terminal creation, input handling, and SSE streaming are unchanged. The only addition is the smooth scroll handler.

---

### Task 5: Build and verify

- [ ] **Step 1: Build the project**

Run: `vp build` (from `apps/null-agent/`)
Expected: Build succeeds with no errors

- [ ] **Step 2: Run dev server and visualize**

Run: `vp dev` (from `apps/null-agent/`)
Expected: Dev server starts, landing page renders with all sections, terminal loads inside the card
