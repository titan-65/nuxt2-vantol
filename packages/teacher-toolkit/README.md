# @vvantol2000/teacher-toolkit

Grade calculation utilities for teachers. Zero dependencies, full TypeScript support.

## Install

```bash
npm install @vvantol2000/teacher-toolkit
```

## API

### `toLetterGrade(percentage, scale?)`

Convert a percentage (0–100) to a letter grade.

```ts
import { toLetterGrade } from '@vvantol2000/teacher-toolkit';

toLetterGrade(95);  // => "A"
toLetterGrade(83);  // => "B"
toLetterGrade(72);  // => "C"
toLetterGrade(65);  // => "D"
toLetterGrade(40);  // => "F"
```

Values outside 0–100 are clamped automatically.

### `toGPA(percentage, scale?)`

Convert a percentage to a 4.0 GPA scale.

```ts
import { toGPA } from '@vvantol2000/teacher-toolkit';

toGPA(92);  // => 4.0
toGPA(85);  // => 3.0
toGPA(75);  // => 2.0
```

### `weightedAverage(components)`

Calculate a weighted final grade from multiple components.

```ts
import { weightedAverage } from '@vvantol2000/teacher-toolkit';

weightedAverage([
  { name: 'Homework', score: 90, weight: 0.4 },
  { name: 'Exam', score: 80, weight: 0.6 },
]);  // => 84
```

### `curveByHighest(scores, targetHigh?)`

Curve all scores so the highest reaches the target (default: 100).

```ts
import { curveByHighest } from '@vvantol2000/teacher-toolkit';

curveByHighest([70, 80, 90], 100);  // => [80, 90, 100]
```

### `curveByMean(scores, targetMean?)`

Shift all scores so the class mean reaches the target (default: 75).

```ts
import { curveByMean } from '@vvantol2000/teacher-toolkit';

curveByMean([60, 70, 80], 75);  // => [65, 75, 85]
```

### `classStats(scores)`

Get descriptive statistics for a set of scores.

```ts
import { classStats } from '@vvantol2000/teacher-toolkit';

classStats([90, 80, 70, 60, 50]);
// => {
//   mean: 70,
//   median: 70,
//   stdDev: 14.14,
//   highest: 90,
//   lowest: 50,
//   count: 5
// }
```

### Custom Grade Scale

Pass a custom scale to `toLetterGrade` and `toGPA`:

```ts
import { toLetterGrade } from '@vvantol2000/teacher-toolkit';

const scale = [
  { letter: 'A+', min: 97, max: 100, gpa: 4.0 },
  { letter: 'A',  min: 93, max: 96,  gpa: 4.0 },
  { letter: 'A-', min: 90, max: 92,  gpa: 3.7 },
  // ...
];

toLetterGrade(95, scale);  // => "A"
```

## Types

```ts
interface GradeScale {
  letter: string;
  min: number;
  max: number;
  gpa: number;
}

interface WeightedComponent {
  name: string;
  score: number;
  weight: number;
}

interface ClassStats {
  mean: number;
  median: number;
  stdDev: number;
  highest: number;
  lowest: number;
  count: number;
}
```

## License

MIT
