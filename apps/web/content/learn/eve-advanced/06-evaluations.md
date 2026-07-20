---
title: "Evaluations: Catch Regressions Before They Ship"
description: "Define scored checks with defineEval under evals/ and run them with eve eval. Covers the t context, assertions (gate vs soft), LLM-as-judge, datasets, and wiring evals into CI on deploy and schedule."
series: "eve-advanced"
order: 6
feature: "defineEval / evals/"
sourceUrl: "https://eve.dev/docs/evals/overview"
---

## What it is

An eval is a scored check that runs your agent against real sessions and grades the result, catching regressions when you change a prompt or a tool. Evals exercise the same HTTP surface your users hit: the runner boots (or targets) a real agent server, drives sessions through the TypeScript client protocol, and grades what comes back. A passing eval means the agent booted, accepted a request, and produced what you asserted.

Eve discovers evals under the app-root `evals/` directory, in `.eval.ts` files. The file path is the eval's identity — `evals/weather/brooklyn-forecast.eval.ts` becomes id `weather/brooklyn-forecast`. Every `evals/` directory needs exactly one `evals.config.ts` at its root.

## Why you'd care

Changing an instruction or a tool can silently break behavior. Evals turn "it feels fine" into a repeatable gate: did the agent call the right tool, complete the run, and say the right thing? Run them on every deploy and on a schedule, and regressions block the merge instead of reaching users.

## Before

You re-read the agent's replies by hand after each change, hoping nothing broke. There's no automated signal, and a prompt tweak quietly drops a tool call.

## After

A minimal eval is one `async test(t)` function. Drive with `t`, assert with `t`:

```ts [evals/weather/brooklyn-forecast.eval.ts]
import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "Basic message and tool-usage coverage for the weather agent.",
  async test(t) {
    await t.send("What is the weather in Brooklyn?");
    t.succeeded();
    t.calledTool("get_weather");
    t.check(t.reply, includes("Sunny"));
  },
});
```

The required `evals.config.ts` (optional fields) declares shared defaults:

```ts [evals/evals.config.ts]
import { defineEvalConfig } from "eve/evals";
import { Braintrust } from "eve/evals/reporters";

export default defineEvalConfig({
  judge: { model: "openai/gpt-5.4-mini" },
  reporters: [Braintrust({ projectName: "my-agent" })],
});
```

`t` is both driver and assertion surface. Drive with `t.send(...)`, `t.start(...)`, `t.respond(...)`, `t.newSession()`, and read back `t.reply`, `t.sessionId`, `t.events`. Assert with three surfaces: scoped methods (`t.succeeded()`, `t.calledTool(...)`), `t.check(value, assertion)` with matchers from `eve/evals/expect`, and `t.judge.autoevals.*` for LLM-as-judge.

**Gate vs soft.** Run-level methods, `includes`, `equals`, `matches` are gates (hard; a miss exits non-zero). `similarity` and every `t.judge.*` are soft (tracked in reports, non-fatal unless `--strict`). Promote/demote per assertion: `.gate(threshold?)`, `.soft(threshold?)`, `.atLeast(threshold)`.

## Do it yourself

1. Create `evals/evals.config.ts` (empty `defineEvalConfig({})` is enough to start).
2. Write `evals/weather/brooklyn-forecast.eval.ts` (above) and `evals/weather/no-tools-for-greetings.eval.ts` asserting `t.notCalledTool("get_weather")` on a greeting.
3. Run them:

```bash
eve eval                 # all discovered evals against a local dev server
eve eval weather         # just evals under evals/weather/
eve eval --url https://<app>   # target a deployment
```

4. Add a multi-turn eval: send a draft turn, `t.check(draft.message, includes("Best regards"))`, then send "now send it" and assert `t.calledTool("send_email")`.
5. Add a judge for fuzzy quality: `t.judge.autoevals.closedQA("cites a source").atLeast(0.7)`.
6. Fan out over a dataset by default-exporting an array of `defineEval(...)` values; load fixtures with `loadJson`/`loadYaml` from `eve/evals/loaders`.
7. Wire into CI: `eve eval --strict --junit .eve/junit.xml`. `--strict` makes soft threshold misses fail the build; `--junit` gives per-eval annotations.

## Gotchas

- **Exit codes:** `0` = all gates passed (and soft thresholds under `--strict`); `1` = a failed gate, execution error, or strict miss; `2` = config error. `t.skip(reason)` is reported separately and never changes the exit code.
- **Evals hit a live model.** The CI environment must provide the model-provider credentials. Against a deployment, pass `--url "$DEPLOY_URL"`.
- **Run on deploy and schedule.** Run `eve eval --strict --junit .eve/junit.xml` in your deploy pipeline and on a schedule so score regressions are caught continuously, not just at merge.
- **`mockModel` for fixtures.** When an eval needs the runtime without a provider call, `import { mockModel } from "eve/evals"` in `agent/agent.ts` for a deterministic fixture agent.
- **Artifacts.** Each run drops `.eve/evals/<timestamp>/` with `summary.json`, `results.jsonl`, and per-eval streams — the full story when something fails.

## Recap

Evals are scored checks under `evals/*.eval.ts` driven and asserted through `t`. Use scoped methods, `t.check` matchers, and `t.judge.*` for grading; gates fail the build, soft assertions track. Run `eve eval --strict --junit` in CI on every deploy and on a schedule. Next: ship the agent to production.
