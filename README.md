# Vantol Bennett — Monorepo

[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Vite+](https://img.shields.io/badge/Vite+-646CFF?logo=vite&logoColor=white)](https://viteplus.dev/)
[![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Personal portfolio and open-source packages, managed as a pnpm monorepo.

## Structure

```
├── apps/
│   └── web/                      # Portfolio website (Nuxt 4)
├── packages/
│   └── teacher-toolkit/          # Grade calculation utilities for teachers
├── pnpm-workspace.yaml
└── vite.config.ts                # Vite+ task orchestration
```

## Quick Start

```bash
pnpm install
pnpm dev            # Start portfolio dev server
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start the Nuxt dev server |
| `pnpm build` | Build portfolio for production |
| `pnpm generate` | Static site generation |
| `pnpm test` | Run tests across all packages |

## Packages

### `@vvantol2000/teacher-toolkit`

Grade calculation utilities for teachers — letter grades, GPA, weighted averages, score curving, and class statistics.

```bash
npm install @vvantol2000/teacher-toolkit
```

```ts
import { toLetterGrade, weightedAverage, classStats } from '@vvantol2000/teacher-toolkit';

toLetterGrade(87);                    // => "B"
weightedAverage([
  { name: 'Quiz', score: 92, weight: 0.2 },
  { name: 'Final', score: 85, weight: 0.8 },
]);                                   // => 86.4
classStats([90, 82, 75, 68, 55]);     // => { mean: 74, median: 75, ... }
```

See [packages/teacher-toolkit/README.md](packages/teacher-toolkit/README.md) for full API.

## Stack

- **Framework:** Nuxt 4 + Nuxt Content v3
- **Styling:** Tailwind CSS v4 + shadcn-vue
- **Auth / DB:** Firebase
- **Deployment:** Vercel
- **Package Manager:** pnpm
- **Tooling:** Vite+
