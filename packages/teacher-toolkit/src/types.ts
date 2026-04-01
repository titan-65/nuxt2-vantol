export interface GradeScale {
  letter: string;
  min: number;
  max: number;
  gpa: number;
}

export interface WeightedComponent {
  name: string;
  score: number;
  weight: number;
}

export interface ClassStats {
  mean: number;
  median: number;
  stdDev: number;
  highest: number;
  lowest: number;
  count: number;
}
