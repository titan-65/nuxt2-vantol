import { defineAgent } from "eve";

export default defineAgent({
  name: "Eve Site Assistant",
  description: "Vantol Bennett's official EVE-powered AI agent for blog search, tutorial guidance, and sandbox execution.",
  model: "openai/gpt-5.4-mini",
  sandbox: {
    timeoutMs: 30000,
  },
});
