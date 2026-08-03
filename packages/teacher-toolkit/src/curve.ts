export function curveByHighest(scores: number[], targetHigh: number = 100): number[] {
  const highest = Math.max(...scores);
  if (highest >= targetHigh) return [...scores];

  const boost = targetHigh - highest;
  return scores.map((s) => Math.min(100, s + boost));
}

export function curveByMean(scores: number[], targetMean: number = 75): number[] {
  if (scores.length === 0) return [];

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const shift = targetMean - mean;
  return scores.map((s) => Math.max(0, Math.min(100, s + shift)));
}
