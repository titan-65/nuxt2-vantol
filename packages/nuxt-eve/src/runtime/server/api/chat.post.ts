import { defineEventHandler, readBody, getRouterParam } from "h3";
import { runEveAgent } from "../engine";

export default defineEventHandler(async (event) => {
  const agentId = getRouterParam(event, "agent") || "default";
  const body = await readBody(event);

  if (!body || !body.prompt) {
    return {
      error: true,
      message: "Missing prompt in request body",
    };
  }

  const result = await runEveAgent({
    agentId,
    prompt: body.prompt,
    conversationId: body.conversationId,
    context: body.context,
  });

  return {
    success: true,
    data: result,
  };
});
