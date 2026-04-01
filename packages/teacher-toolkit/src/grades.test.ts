import { describe, it, expect } from 'vitest';
import { toLetterGrade, toGPA } from './grades';
import { weightedAverage } from './weights';
import { curveByHighest, curveByMean } from './curve';
import { classStats } from './stats';

describe('toLetterGrade', () => {
  it('converts percentages to letter grades', () => {
    expect(toLetterGrade(95)).toBe('A');
    expect(toLetterGrade(83)).toBe('B');
    expect(toLetterGrade(72)).toBe('C');
    expect(toLetterGrade(65)).toBe('D');
    expect(toLetterGrade(40)).toBe('F');
  });

  it('clamps out-of-range values', () => {
    expect(toLetterGrade(110)).toBe('A');
    expect(toLetterGrade(-5)).toBe('F');
  });

  it('handles boundary values', () => {
    expect(toLetterGrade(90)).toBe('A');
    expect(toLetterGrade(80)).toBe('B');
    expect(toLetterGrade(70)).toBe('C');
    expect(toLetterGrade(60)).toBe('D');
    expect(toLetterGrade(59)).toBe('F');
  });
});

describe('toGPA', () => {
  it('converts to 4.0 scale', () => {
    expect(toGPA(92)).toBe(4.0);
    expect(toGPA(85)).toBe(3.0);
    expect(toGPA(75)).toBe(2.0);
    expect(toGPA(65)).toBe(1.0);
    expect(toGPA(55)).toBe(0.0);
  });
});

describe('weightedAverage', () => {
  it('calculates weighted grade', () => {
    const result = weightedAverage([
      { name: 'Homework', score: 90, weight: 0.4 },
      { name: 'Exam', score: 80, weight: 0.6 },
    ]);
    expect(result).toBe(84);
  });

  it('returns 0 for empty input', () => {
    expect(weightedAverage([])).toBe(0);
  });

  it('returns 0 when all weights are 0', () => {
    expect(weightedAverage([{ name: 'Test', score: 90, weight: 0 }])).toBe(0);
  });

  it('handles single component', () => {
    expect(weightedAverage([{ name: 'Final', score: 88, weight: 1 }])).toBe(88);
  });
});

describe('curveByHighest', () => {
  it('curves scores up to target', () => {
    const curved = curveByHighest([70, 80, 90], 100);
    expect(curved).toEqual([80, 90, 100]);
  });

  it('does not curve if highest already meets target', () => {
    const scores = [70, 80, 95];
    expect(curveByHighest(scores, 95)).toEqual([70, 80, 95]);
  });

  it('caps at 100', () => {
    const curved = curveByHighest([85, 95], 100);
    expect(curved).toEqual([90, 100]);
  });
});

describe('curveByMean', () => {
  it('shifts scores to target mean', () => {
    const curved = curveByMean([60, 70, 80], 75);
    expect(curved).toEqual([65, 75, 85]);
  });

  it('returns empty for empty input', () => {
    expect(curveByMean([])).toEqual([]);
  });

  it('clamps to 0-100 range', () => {
    const curved = curveByMean([10, 20], 75);
    expect(curved).toEqual([70, 80]);
  });
});

describe('classStats', () => {
  it('calculates stats correctly', () => {
    const stats = classStats([90, 80, 70, 60, 50]);
    expect(stats.mean).toBe(70);
    expect(stats.median).toBe(70);
    expect(stats.highest).toBe(90);
    expect(stats.lowest).toBe(50);
    expect(stats.count).toBe(5);
  });

  it('returns zeros for empty input', () => {
    const stats = classStats([]);
    expect(stats.mean).toBe(0);
    expect(stats.count).toBe(0);
  });

  it('calculates median for even count', () => {
    const stats = classStats([70, 80, 90, 100]);
    expect(stats.median).toBe(85);
  });
});
