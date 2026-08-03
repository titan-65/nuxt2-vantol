---
title: "Channels: Let People Talk to It"
description: "The same agent codebase serves the CLI, web chat, Slack, Discord and more. Add a channel file to surface your agent where people are."
series: "eve-core"
order: 5
feature: "channels/"
sourceUrl: "https://eve.dev/docs/channels/overview"
---

## What it is

Channels connect your agent to the places people talk — the terminal, a web chat, Slack, Discord, Teams. One agent codebase, many surfaces.

## Why you'd care

You write the agent once. Eve handles turning platform input into a message and delivering the response back in the right shape.

## Before

You can only talk to the agent via the local `eve` CLI.

## After

The local run already is a channel. To add Slack, drop a channel file:

```ts [agent/channels/slack.ts]
import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

export default slackChannel({
  credentials: connectSlackCredentials("slack/my-agent"),
});
```

The same agent now answers in Slack. Web chat, Discord, and the rest follow the same pattern from `eve/channels/*`.

## Do it yourself

1. Run `eve dev` and hold a conversation in the terminal (your default channel).
2. Skim the docs `channels/overview` and add the Slack channel file above.
3. Confirm the agent answers from the same `instructions.md`/`tools` in both places.

## Gotchas

- Your tool code doesn't need to know which channel a message came from — Eve abstracts that.
- Each channel is its own file under `channels/`.

## Recap

Channels surface one agent everywhere. The CLI works out of the box; add a file to reach Slack, Discord, or web chat. Next: run it for real and see durability.
