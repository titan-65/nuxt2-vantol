import type { H3Event } from "h3";
import type { z } from "zod";

export interface EveToolMeta<T extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  parameters: T;
}

export interface EveToolContext {
  event?: H3Event;
}

export interface EveToolDefinition<T extends z.ZodTypeAny = z.ZodTypeAny> extends EveToolMeta<T> {
  execute: (args: z.infer<T>, context: EveToolContext) => Promise<unknown> | unknown;
}

/**
 * Type-safe helper to define an Eve Agent Tool
 */
export function defineEveTool<T extends z.ZodTypeAny>(
  meta: EveToolMeta<T>,
  handler: (args: z.infer<T>, context: EveToolContext) => Promise<unknown> | unknown,
): EveToolDefinition<T> {
  return {
    ...meta,
    execute: handler,
  };
}
