# Web Search & Fetch Tools Design

**Date:** 2026-04-05
**Status:** Draft

## Overview

Add two new tools to null-agent that give the agent web access: searching the internet and fetching URL content. This enables the agent to look up documentation, research topics, and read web pages during conversations.

## Tools

### `webSearchTool` (`web_search`)

Searches the web using the Tavily Search API and returns extracted, readable content snippets (not just links).

**Parameters:**

- `query` (required, string) — The search query
- `maxResults` (optional, number) — Number of results to return. Default: 5. Max: 10.

**Response format:**

```
## [Result Title](url)
Extracted content snippet...

## [Result Title](url)
Extracted content snippet...
```

**Error handling:**

- Missing API key: "Error: TAVILY_API_KEY not configured. Set the environment variable or run `null-agent auth tavily`."
- API error: "Search failed: <API error message>"
- Empty results: "No results found for '<query>'."

**Risk:** Low (read-only)

### `webFetchTool` (`web_fetch`)

Fetches a URL and converts its content to readable text.

**Parameters:**

- `url` (required, string) — The URL to fetch

**Response format:**

- HTML pages: stripped to readable text, formatted as markdown
- Non-HTML responses: returned as-is with content-type header noted
- Max response: 1MB (truncated with notice)
- Timeout: 30s

**Error handling:**

- Invalid URL: "Error: Invalid URL '<url>'."
- Network error: "Error: Failed to fetch '<url>': <error message>"
- Non-200 status: "Error: HTTP <status> for '<url>'."
- Timeout: "Error: Request to '<url>' timed out after 30s."

**Risk:** Low (read-only)

## Implementation

### File: `src/tools/web.ts`

Single file containing both tools. Uses Node.js built-in `fetch()` for web_fetch (no new dependencies). Tavily API called via `fetch()` as well.

**API key resolution:**

1. `TAVILY_API_KEY` environment variable
2. `~/.null-agent/credentials.json` under `tavily` key

**HTML stripping:** Simple regex-based extraction (no new dependencies). Strips `<script>`, `<style>`, tags, and normalizes whitespace. Consistent with the project's existing lightweight approach.

### Exports

- `src/tools/index.ts`: Add `webSearchTool`, `webFetchTool` to named exports and `builtinTools` array
- `src/index.ts`: Re-export both tools

### Auth

Add `tavily` as a configurable provider in `src/auth/`:

- `null-agent auth tavily` — interactive setup
- `null-agent auth status` — shows Tavily key status alongside existing providers

### Documentation

Update README.md:

- Add Tavily to the providers table (or a new "Web Tools" section)
- Document `TAVILY_API_KEY` environment variable
- Add web tools to the tools table
- Get a Tavily key: https://tavily.com/

## Dependencies

None. Uses Node.js built-in `fetch()` (available since Node 18, project requires Node >= 20).

## Not Included

- No browser automation or JavaScript execution
- No search result caching
- No URL allowlist/denylist (can be added later)
- No web search endpoints in the HTTP server (tools are agent-level)
- No sitemap or robots.txt respect (can be added later if needed)
