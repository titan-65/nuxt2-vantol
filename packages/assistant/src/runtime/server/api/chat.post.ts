import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { processQuery } from "../../utils/engine";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ query?: unknown }>(event);

  if (typeof body?.query !== "string" || body.query.trim().length === 0) {
    setResponseStatus(event, 400);
    return { error: "invalid_query", message: "Property 'query' must be a non-empty string." };
  }

  const response = processQuery(body.query);

  return {
    ok: true,
    query: body.query,
    ...response,
    timestamp: new Date().toISOString(),
  };
});
