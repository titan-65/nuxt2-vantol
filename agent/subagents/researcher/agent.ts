import { defineAgent } from "eve";

export default defineAgent({
  description: "Specialist researcher subagent for deep-dive investigation of complex topics before the root agent responds.",
  model: "openai/gpt-5.4-mini",
});
