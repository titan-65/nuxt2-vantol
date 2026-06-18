# pi

CLI-first AI coding agent built in the [Zero language](https://zerolang.ai). Modeled on [pi-mono](https://github.com/badlogic/pi-mono).

## What it is

A single binary, `pi`, that can chat with an LLM, read and write files, run shell commands, and persist conversations as sessions. Ships with two providers (Anthropic Messages, OpenAI Chat Completions) and a five-tool registry (`read_file`, `write_file`, `list_dir`, `exec_command`, `grep`).

## What it is not (in v1)

- **No REPL.** The hosted Zero stdlib has no `stdin()` factory. v1 is one-shot CLI only.
- **No streaming.** `std.http.fetch` returns full bodies. v1 prints the assistant reply when it arrives.
- **No proactive engine / user model / privacy mode.** Those are null-agent features; pi is a different product and starts smaller.

See `CONTEXT.md` for the full glossary and the three v1 ADRs.

## Layout

- `zero.toml`, `zero.graph` &mdash; the Zero package; the source of truth for the CLI binary.
- `src/main.0` and `src/*.0` &mdash; the Zero source (graph + projections).
- `package.json`, `vite.config.ts`, `index.html`, `src/main.ts` &mdash; a Vite+ static landing page that documents the binary.
- `CONTEXT.md` &mdash; the domain glossary. Read this first.

## Build and run

The Zero binary is the deliverable. The Vite+ build is a static page.

```sh
# Run the CLI on the host
cd apps/pi
zero run -- "list the files in src"

# Run a subcommand
zero run -- tools list

# Run with the FauxProvider (no API key needed)
zero run -- --provider faux chat --prompt "hello"

# Static checks
zero check
zero test

# Vite+ landing page
vp dev
vp build
vp check
```

## Environment

Provider keys are read from the environment:

- `ANTHROPIC_API_KEY` &mdash; required for the Anthropic provider.
- `OPENAI_API_KEY` &mdash; required for the OpenAI provider.

If neither is set and `--provider` is not given, the binary prints a usage message and exits non-zero.
