# Null-Agent TUI Overhaul Design

## Context

Date: 2026-04-09
Status: Draft

## Overview

Comprehensive redesign of the null-agent TUI to create a "Terminal IDE" experience with an expressive animated mascot, context sidebar, and polished interactions.

## Design Philosophy

1. **Expressiveness** - The TUI should feel alive with personality
2. **Information density** - Show useful context without cluttering
3. **Familiar patterns** - Follow established terminal/IDE conventions
4. **Progressive disclosure** - Essential info visible, details accessible

---

## Layout Structure

### New Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ StatusBar: null-agent · project · branch ● · model · status      │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│  Context       │  ChatPanel                                     │
│  Panel         │  - Message history with scrollback            │
│  (collapsible) │  - Code syntax highlighting                    │
│                │  - Expandable tool results                    │
│  - File tree   │  - Animated message arrivals                  │
│  - Recent      │                                                │
│  - Git status  │                                                │
│                │                                                │
├────────────────┴────────────────────────────────────────────────┤
│ Notifications (stacking, dismissible)                             │
├─────────────────────────────────────────────────────────────────┤
│ AgentBar: ◉◡◠ mascot + mood │ InputBar: command input + hints    │
└─────────────────────────────────────────────────────────────────┘
```

### Panel Behavior

- **Context Panel**: 25% width (min 20 cols, max 40 cols), collapsible with `Ctrl+B`
- **ChatPanel**: Takes remaining width
- **Responsive**: Below 80 cols, context panel auto-hides

---

## Components

### 1. StatusBar

**Left side:**
- `null-agent` (bold, accent color)
- Project name (truncated with `…` if > 20 chars)
- Git branch (yellow, if in git repo)
- Dirty indicator (`●` red if uncommitted, green if clean)

**Right side:**
- Provider/model (gray, truncated)
- Tool count
- Status with color coding

**Updates:** Real-time updates when state changes

### 2. Context Panel

**Sections:**

**File Tree (top)**
- Shows project root
- Expands 2 levels deep
- Files colored by type (`.ts` cyan, `.json` yellow, `.md` green)
- `node_modules/` and `.git/` collapsed by default

**Recent Files (middle)**
- Last 5 edited files
- Timestamps relative ("2m ago")

**Git Status (bottom)**
- Modified files count
- Staged/unstaged indicators
- Current branch

**Toggle:** `Ctrl+B` or `Ctrl+\`

### 3. ChatPanel

**Message rendering:**
- Role prefix with color (`▸ you`, `▸ assistant`)
- Streaming indicator (⠋ spinner) for in-progress
- Timestamps on hover (relative)

**Code blocks:**
- Language label top-right
- Syntax highlighting (TS, JS, Bash, JSON, MD)
- Copy button hint (`Ctrl+C to copy`)
- Line numbers optional (toggle)

**Tool calls:**
- Collapsible (expanded by default, `v` to collapse)
- Shows tool name + summary result
- Status indicator (executing/success/error)

**Scrolling:**
- `Page Up/Down` or `Shift+↑/↓` to scroll
- `gg` to jump to top, `G` to jump to bottom
- Visual scroll indicator on right edge

### 4. NullFace (Mascot)

**Design:** 3-line ASCII art

```
    ╭───╮
    │◠◠◠│  ← eyes + mouth expression
    ╰─┬─╯
      │    ← body/pose variations per mood
   ~~~~~
```

**Moods & Expressions:**

| Mood | Eyes | Mouth | Color | Animation |
|------|------|-------|-------|-----------|
| idle | `◠◠` | `◡` | blue | slow blink |
| thinking | `◠?` | `~` | yellow | occasional tilt |
| executing | `◠◠` | `⟳` | magenta | spin |
| happy | `◡◡` | `♥` | green | bounce |
| waiting | `◠◠` | `…` | gray | pulse |
| sleeping | `-.-` | `z` | gray | Zzz float |
| excited | `★★` | `✧` | cyan | sparkle |
| confused | `◠?` | `/` | yellow | tilt |
| error | `◠◠` | `×` | red | shake |
| success | `◡◡` | `✓` | green | pop |
| loading | `◠◠` | `…` | blue | dots wave |

**Animation:**
- Eyes blink every 3-5 seconds (random)
- Mouth expressions cycle every 500ms (8 frames)
- Mood transitions have 200ms fade
- Special reactions: shake on error, bounce on success

**Positioning:**
- Left side of AgentBar
- Mood color matches status color

### 5. InputBar

**Features:**
- Single line by default
- `Shift+Enter` for multi-line
- `↑/↓` for command history (persisted)
- `Tab` for completion hints
- `Ctrl+A/E` jump start/end
- `Ctrl+K` clear line
- `Ctrl+C` cancel current input

**Visual states:**
- Idle: green border, blinking cursor
- Busy: yellow border, no cursor
- Error: red border, shake animation

**Hints (right side):**
- `[↑ history]` when empty
- `[tab complete]` when partial
- `[shift+enter for multi-line]`

### 6. Notifications

**Behavior:**
- Stack up to 3 visible
- Click to dismiss
- `d` key to dismiss oldest
- History viewable with `Ctrl+H`

**Types with icons:**
- `git:` git events (yellow)
- `file:` file events (green/red based on action)
- `error:` errors (red, persistent until dismissed)
- `tip:` helpful hints (cyan)

**Animation:** Slide in from top-right, fade out after 5s

---

## Theme System

### Dark Mode (default)

```typescript
const darkTheme = {
  background: "#1a1a2e",
  foreground: "#eaeaea",
  accent: "#6c5ce7",      // purple for branding
  success: "#00b894",     // green
  warning: "#fdcb6e",     // yellow
  error: "#ff7675",       // red
  info: "#74b9ff",        // blue
  muted: "#636e72",       // gray
  border: "#2d2d44",
};
```

### Light Mode

```typescript
const lightTheme = {
  background: "#ffffff",
  foreground: "#2d3436",
  accent: "#6c5ce7",
  success: "#00b894",
  warning: "#e17055",
  error: "#d63031",
  info: "#0984e3",
  muted: "#b2bec3",
  border: "#dfe6e9",
};
```

### Toggle

- `Ctrl+T` or `null-agent config theme dark|light`
- Persisted in config

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Toggle context panel |
| `Ctrl+H` | Notification history |
| `Ctrl+T` | Toggle theme |
| `↑/↓` | Command history |
| `Tab` | Autocomplete |
| `Shift+Enter` | Multi-line input |
| `Ctrl+K` | Clear line |
| `Ctrl+C` | Cancel input |
| `Ctrl+L` | Clear screen |
| `Esc` | Cancel current action |

---

## Implementation Notes

### Files to modify

```
packages/null-agent/src/tui/
├── index.tsx           # Update props/layout
├── app.tsx            # State management, layout
├── context.ts         # Context detection
├── components/
│   ├── StatusBar.tsx  # Add truncation, updates
│   ├── ChatPanel.tsx  # Scrollback, syntax
│   ├── ContextPanel.tsx  # NEW - file tree, recent, git
│   ├── NullFace.tsx   # 3-line ASCII redesign
│   ├── InputBar.tsx   # History, multi-line, hints
│   ├── Notification.tsx # Stacking, dismiss
│   ├── ToolCall.tsx   # Collapsible, expand
│   └── FormattedText.tsx # Syntax highlighting
└── theme.ts           # NEW - theme system
```

### New dependencies

- `nanospinner` or custom for spinners
- No new deps - use existing Ink patterns

### Backward compatibility

- `ESC` to exit overlay modes
- Graceful degradation if terminal < 80 cols
- Theme preference persisted

---

## Success Criteria

1. All 182 tests pass
2. TUI renders correctly at 80, 120, 200 col widths
3. Theme toggle works without restart
4. Command history persists across sessions
5. Context panel shows accurate project state
6. NullFace animations are smooth (no flicker)
7. Scrollback works for 1000+ messages
