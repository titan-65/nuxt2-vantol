import { defineEventHandler, getQuery, getRouterParam, setHeader } from "h3";
import { runEveAgent } from "../engine";

export default defineEventHandler(async (event) => {
  const agentId = getRouterParam(event, "agent") || "default";
  const query = getQuery(event);
  const prompt = (query.prompt as string) || "Hello Eve Agent";
  const conversationId = query.conversationId as string | undefined;

  setHeader(event, "Content-Type", "text/event-stream");
  setHeader(event, "Cache-Control", "no-cache");
  setHeader(event, "Connection", "keep-alive");

  const res = event.node.res;

  const sendEvent = (eventKind: string, data: unknown) => {
    res.write(`event: ${eventKind}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("start", { agentId, prompt });

  await runEveAgent({
    agentId,
    prompt,
    conversationId,
    onStep: (step) => {
      sendEvent("step", step);
    },
    onToken: (token) => {
      sendEvent("token", { token });
    },
  });

  sendEvent("done", { status: "complete" });
  res.end();
});
