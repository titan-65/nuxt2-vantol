import type { WeightedComponent } from "./types";

export function weightedAverage(components: WeightedComponent[]): number {
  if (components.length === 0) return 0;

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 0;

  const weighted = components.reduce((sum, c) => sum + c.score * c.weight, 0);

  return Math.round((weighted / totalWeight) * 100) / 100;
}
