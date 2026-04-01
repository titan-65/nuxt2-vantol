import type { ClassStats } from './types';

export function classStats(scores: number[]): ClassStats {
  if (scores.length === 0) {
    return { mean: 0, median: 0, stdDev: 0, highest: 0, lowest: 0, count: 0 };
  }

  const sorted = [...scores].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  const variance =
    sorted.reduce((acc, s) => acc + (s - mean) ** 2, 0) / count;
  const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;

  return {
    mean: Math.round(mean * 100) / 100,
    median,
    stdDev,
    highest: sorted[count - 1],
    lowest: sorted[0],
    count,
  };
}
