# Pi

Pi is a CLI-first AI coding agent built in the [Zero language](https://zerolang.ai). It is modeled on [pi-mono](https://github.com/badlogic/pi-mono) and ships as a single binary that can read files, run shell commands, and chat with an LLM provider.

## Language

**Agent**:
The orchestrator that owns the message history, dispatches tool calls, and produces the final assistant reply. A v1 Agent is single-turn (one user message → one assistant reply) and lives entirely in `apps/pi/src/agent.0`.
_Avoid_: assistant, model, runner

**Provider**:
An LLM backend adapter that turns a normalized `ProviderRequest` (system + messages + tool list) into a normalized `ProviderResponse` (text + tool calls + stop reason). v1 ships two Provider implementations: `AnthropicProvider` (Messages API) and `OpenAIProvider` (Chat Completions API). A third implementation, `FauxProvider`, returns canned bytes for tests.
_Avoid_: backend, model client, API wrapper

**Provider interface**:
The shape every Provider implementation must satisfy. The shape is a pair of functions (`build_request`, `parse_response`) rather than a dynamic dispatch table, because Zero has no reflection. The interface is the only place where the Anthropic and OpenAI tool-use formats diverge.
_Avoid_: trait, abstract class

**Tool**:
A capability the Agent can invoke on behalf of the model: `read_file`, `write_file`, `list_dir`, `exec_command`, `grep`. Defined by a `ToolDef` record (name, description, JSON Schema for arguments, executor function) and registered in a static array. The Agent's dispatcher `match`es on `ToolDef.name`.
_Avoid_: command, function, action

**ToolDef**:
The record that describes a single Tool to the model: `name`, `description`, `arguments_json` (a JSON Schema fragment as a string), and the executor function. The same record is used to render tool definitions in the Provider request body and to dispatch calls back from the model.
_Avoid_: tool spec, tool schema

**Session**:
A persistent conversation between a user and an Agent. Stored as append-only JSON Lines at `~/.pi/sessions/<id>.jsonl`. One file per session, one record per turn (user message, assistant reply, tool call, tool result).
_Avoid_: conversation, thread, chat history

**Session id**:
A short opaque string (12 hex chars) that names a Session file under `~/.pi/sessions/`. Generated on first turn; passed via `--session <id>` to resume an existing session. The id is purely a filename, not a UUID.
_Avoid_: conversation id, thread id, GUID

**Turn**:
One round trip in a Session: a user message, the Agent's loop of model-then-tool-calls until a final reply, and the appended records that capture it. A turn is the unit of session persistence.
_Avoid_: message, round, exchange

**Slash command**:
A top-level subcommand on the `pi` binary, not an in-REPL directive: `pi chat`, `pi tools list`, `pi sessions list`, `pi sessions show <id>`, `pi providers list`. The skill brief said "slash commands"; in v1 they are subcommands because there is no REPL.
_Avoid_: REPL command, slash directive

**FauxProvider**:
A Provider implementation that ignores the request and returns a canned `ProviderResponse` for tests. Lives in `src/testing/faux-provider.0` and is registered as a `--provider faux` CLI option so the end-to-end loop can be exercised without an API key.
_Avoid_: mock provider, stub provider, test double

**ADR-0001 — No REPL in v1**:
The hosted Zero stdlib exposes no `stdin()` factory. A real interactive REPL is not buildable in v1, so the CLI is one-shot only: `pi "prompt"`, `pi chat --session <id>`, `pi tools list`. Future v2 may add a REPL when a `std.io.stdin()` capability lands.
_Avoid_: term "REPL" used to describe a subcommand dispatcher

**ADR-0002 — No streaming in v1**:
`std.http.fetch` returns the full response body in one buffer. The visible `Conn` and `HttpClient` surfaces in the stdlib catalog have no streaming read methods. v1 prints the full assistant reply when it arrives. Future v2 may add token-by-token streaming when `Conn.read` lands.
_Avoid_: term "streaming" used to describe the v1 print path

**ADR-0003 — JSON Lines session storage**:
Each session is one file at `~/.pi/sessions/<id>.jsonl`. One JSON object per line; append-only; chunkable reads via `std.fs.readBytesAt`. Chosen over single-file JSON for crash safety (no full-file rewrite on each turn) and inspectability (`tail -f`).
_Avoid_: term "JSON file" used to describe a session

## Example dialogue

> **Dev:** "I'm wiring up a new Tool. Where does the JSON Schema for its arguments live?"
>
> **Domain expert:** "On the `ToolDef` record as a string under `arguments_json`. The Provider implementations don't validate the JSON Schema at the wire — they emit it verbatim into the request body's tool list. Validation happens at the model's side."
>
> **Dev:** "Got it. And if I add a new tool, the dispatcher `match` in `src/agent.0` is the only place that needs to know?"
>
> **Domain expert:** "Right. The `ToolDef` array is the source of truth for the model. The `match` in the Agent's loop is the source of truth for execution. They share names by convention, not by graph edge."
>
> **Dev:** "And the Session file is just the transcript — the Tool definitions and Provider choice are re-loaded from the package on resume?"
>
> **Domain expert:** "Correct. Sessions store messages, not configuration. To switch providers between turns you restart the binary with `--provider`."
