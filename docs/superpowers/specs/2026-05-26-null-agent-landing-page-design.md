# null-agent Landing Page Redesign

## Overview

Transform the null-agent web terminal from a full-viewport xterm.js raw terminal into a full product landing page. The terminal remains the central feature — embedded in a styled card within a marketing-style page — matching the design language of the main blog (vantolbennett.com).

## Design System

Matches blog design tokens exactly:

| Token           | Value                            | Usage                     |
| --------------- | -------------------------------- | ------------------------- |
| Page background | `#0a0a0a`                        | `bg-[#0a0a0a]`            |
| Card surface    | `#111111`                        | `bg-[#111]`               |
| Accent          | `#f5c542`                        | Gold — CTAs, hover states |
| Text primary    | `#fafafa`                        | Headings, body            |
| Text muted      | `#a1a1aa`                        | Descriptions              |
| Borders         | `rgba(255,255,255,0.1)`          | Card borders, dividers    |
| Font            | Inter, system-ui, sans-serif     | Body text                 |
| Mono font       | JetBrains Mono, Menlo, monospace | Terminal, code            |

## Architecture

```
Vite + TypeScript + xterm.js + Tailwind CSS v4
├── index.html              — Full landing page HTML
├── src/style.css            — Tailwind + xterm overrides
└── src/main.ts              — xterm init, input, SSE, landing interactivity

xterm.js terminal logic stays the same — only the surrounding page changes. The terminal targets a `#terminal` div inside the styled card rather than the full viewport.

## Page Structure

### 1. Sticky Navigation
- `sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10`
- Left: "null-agent" logo/text in gold
- Right: "Docs" + "GitHub" links (`text-zinc-400 hover:text-white transition-colors`)

### 2. Hero Section
- Centered layout, `py-24` vertical padding
- Terminal/diamond icon (gold) above heading
- `text-5xl font-semibold tracking-tight` — "null-agent"
- `text-lg text-zinc-400 mt-4` — "Your AI agent, now in the browser."
- `text-sm text-zinc-500` — "Connect to your null-agent server from anywhere."
- Two CTA buttons:
- Primary: `bg-[#f5c542] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#e0b13a]` — "Connect to Server" (scrolls to terminal card)
- Outline: `border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/5` — "Read the Docs" (opens docs link)

### 3. Terminal Demo Card
- `max-w-4xl mx-auto` width, `mb-24`
- `bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl`
- Title bar (macOS-style):
  - `bg-black/40 border-b border-white/10 px-4 py-2.5 flex items-center gap-2`
  - Red/yellow/green dots (static SVG circles)
  - `text-xs text-zinc-400 font-mono` — "null-agent terminal"
- Terminal area:
  - `h-[400px] p-2` (or dynamic via fitAddon)
  - xterm.js renders inside this container
  - Shows startup banner on load: "null-agent v0.5.1 · web terminal / Connected to <server> / Type /help for commands"

### 4. Features Grid
- `grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6 mb-24`
- 6 feature cards, each `bg-[#111] border border-white/10 rounded-xl p-6`
- Icon at top (SVG inline or icon component), title in `text-sm font-semibold`, description in `text-sm text-zinc-400`
- Hover: `group-hover:text-[#f5c542]` on icon

Features:
1. **Real-time SSE** — Stream AI responses character by character with zero latency
2. **Multi-Provider** — Works with any LLM provider: OpenAI, Anthropic, Google, and more
3. **Tool System** — 49 built-in tools for file operations, code execution, web search, and more
4. **Conversation Memory** — Full history tracking with `/history` command
5. **Clean Terminal UI** — xterm.js with syntax-highlighted output, tool call formatting, and error display
6. **Quick Connect** — Connect to any null-agent server with `/connect <url>`

### 5. How It Works
- `max-w-4xl mx-auto px-6 mb-24`
- Section header: `text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2` — "HOW IT WORKS"
- `text-2xl font-semibold mb-12` — "Get started in three steps"
- 3 columns: `grid md:grid-cols-3 gap-8`
- Each step:
  - Number in gold circle: `w-10 h-10 rounded-full bg-[#f5c542]/10 border border-[#f5c542]/30 flex items-center justify-center text-[#f5c542] font-bold`
  - Step title in `font-semibold mt-4`
  - Description in `text-sm text-zinc-400`

Steps:
1. **Start your server** — Run `null-agent serve` to start the HTTP API server
2. **Open the web terminal** — Connect your browser to the web terminal URL
3. **Chat with your agent** — Type any message and get real-time AI responses

### 6. FAQ
- `max-w-3xl mx-auto px-6 mb-24`
- Section header: `text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2` — "FAQ"
- `text-2xl font-semibold mb-8` — "Common questions"
- Accordion `<details>` elements:
  - `border-b border-white/10 py-4`
  - `<summary>` styled with `text-sm font-medium cursor-pointer list-none flex items-center justify-between`
  - Open state: gold accent on arrow
  - Content: `text-sm text-zinc-400 pt-3`

Questions:
1. What is null-agent? — Interactive coding assistant with multi-provider LLM support
2. How do I install it? — `npm install null-agent` or `npm install -g null-agent`
3. What providers are supported? — OpenAI, Anthropic, Google Gemini, Groq, and more
4. Can I self-host? — Yes, run `null-agent serve` and expose the port
5. Is there a CLI? — Yes, four interfaces: library, REPL, TUI, HTTP server

### 7. Footer
- `border-t border-white/10 bg-[#0a0a0a] py-8`
- `max-w-5xl mx-auto px-6 flex items-center justify-between`
- Left: "null-agent" text in `text-sm text-zinc-500`
- Right: GitHub + Docs icon links (`text-zinc-400 hover:text-white transition-colors`)

## Implementation Plan

### Files to Modify
- `index.html` — Complete rewrite as landing page with all sections
- `src/style.css` — Replace with Tailwind imports + minimal xterm overrides
- `src/main.ts` — Add landing page interactivity (smooth scroll, FAQ toggles, CTA actions); keep all existing terminal logic, just change init target to `#terminal` inside the card

### Dependencies to Add to package.json
- `tailwindcss` (devDependency)
- `@tailwindcss/vite` (devDependency)

### Config
- Tailwind v4 uses `@tailwindcss/vite` Vite plugin — add to root vite.config.ts or create apps/null-agent/vite.config.ts
- No separate tailwind config file needed (Tailwind v4 uses CSS-based config)

### Dependencies
- `tailwindcss` + `@tailwindcss/vite` — styling
- `@xterm/xterm` + `@xterm/addon-fit` — terminal (already installed)

## Technical Notes

- Terminal initialization targets `#terminal` div inside the card, not body
- fitAddon resizes to card container dimensions
- On page load: terminal starts, shows banner, checks health, shows prompt
- All existing commands (`/connect`, `/clear`, `/health`, `/history`, `/help`) work identically
- Scroll behavior: page scrolls normally, terminal scrolls independently within its container
- Responsive: stacks to single column on mobile
- No routing — single page, no framework
```
