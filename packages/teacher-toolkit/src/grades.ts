import type { GradeScale } from './types';

const DEFAULT_SCALE: GradeScale[] = [
  { letter: 'A', min: 90, max: 100, gpa: 4.0 },
  { letter: 'B', min: 80, max: 89, gpa: 3.0 },
  { letter: 'C', min: 70, max: 79, gpa: 2.0 },
  { letter: 'D', min: 60, max: 69, gpa: 1.0 },
  { letter: 'F', min: 0, max: 59, gpa: 0.0 },
];

export function toLetterGrade(
  percentage: number,
  scale: GradeScale[] = DEFAULT_SCALE,
): string {
  const clamped = Math.max(0, Math.min(100, percentage));
  const match = scale.find((s) => clamped >= s.min && clamped <= s.max);
  return match?.letter ?? 'F';
}

export function toGPA(
  percentage: number,
  scale: GradeScale[] = DEFAULT_SCALE,
): number {
  const letter = toLetterGrade(percentage, scale);
  const match = scale.find((s) => s.letter === letter);
  return match?.gpa ?? 0;
}

export { DEFAULT_SCALE };
