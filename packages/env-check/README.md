# @vvantol2000/env-check

[![npm version](https://img.shields.io/npm/v/@vvantol2000/env-check)](https://www.npmjs.com/package/@vvantol2000/env-check)
[![npm downloads](https://img.shields.io/npm/dt/@vvantol2000/env-check)](https://www.npmjs.com/package/@vvantol2000/env-check)
[![license](https://img.shields.io/npm/l/@vvantol2000/env-check)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![tests](https://img.shields.io/badge/tests-25%20passing-brightgreen)](.)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](.)
[![bundle size](https://img.shields.io/badge/bundle-2.3%20kB-lightgrey)](.)

Validate environment variables against a schema. Fail fast at startup with clear error messages.

Zero dependencies. TypeScript support. Works as both a library and a CLI.

---

## The Problem

You deploy your app. It starts. It crashes with:

```
Error: ENOENT: no such file or directory, open './config.json'
```

The real issue? A missing `DATABASE_URL` env var. But the error doesn't tell you that.

**env-check** catches this at startup:

```
env-check failed:
  ✗ DATABASE_URL is required but missing
  ✗ PORT must be a number (got "abc")
```

---

## Quick Start

### Install

```bash
npm install @vvantol2000/env-check
```

### Define your schema

```ts
import { validateEnv } from '@vvantol2000/env-check';

const env = validateEnv({
  DATABASE_URL: { type: 'url', required: true },
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'enum', values: ['development', 'production', 'test'], default: 'development' },
  ADMIN_EMAIL: { type: 'email', required: true },
  DEBUG: { type: 'boolean', default: false },
});

// All valid — use the typed result
console.log(env.DATABASE_URL);  // "https://db.example.com"
console.log(env.PORT);          // 3000 (number)
console.log(env.DEBUG);         // false (boolean)
```

If any variable is missing or invalid, it throws immediately with a clear message listing every problem.

---

## How It Works

1. You define a schema mapping env var names to their expected types
2. `validateEnv()` checks each variable against `process.env` (or a custom object)
3. Missing/invalid vars are collected into a single error
4. Valid vars are returned as a typed object

```ts
// All of these fail at startup, not at runtime
const env = validateEnv({
  DATABASE_URL: { type: 'url', required: true },   // must be a URL
  PORT: { type: 'number', default: 3000 },          // must parse as a number
  NODE_ENV: { type: 'enum', values: ['development', 'production'] }, // must be in the list
  API_KEY: { type: 'string' },                      // must be non-empty
  ADMIN_EMAIL: { type: 'email' },                   // must be valid email
  DEBUG: { type: 'boolean' },                       // must be true/false/1/0
});
```

---

## Validation Behavior

### `required` default

| Config | Missing var behavior |
|---|---|
| `{ type: 'url' }` | **Throws** (defaults to required) |
| `{ type: 'url', required: true }` | **Throws** (explicit) |
| `{ type: 'url', required: false }` | Returns `undefined` |
| `{ type: 'url', default: 'https://fallback.com' }` | Returns default value |
| `{ type: 'url', required: false, default: 'https://...' }` | Returns default value |

When `required` is not set and no `default` is provided, the variable is treated as **required**. This prevents accidentally running with missing config.

### Empty strings

An empty string (`""`) is treated as missing. If a variable is set to an empty string, the `default` value is used if available, otherwise it throws if required.

### Case sensitivity

- `boolean` validator: case-insensitive (`TRUE`, `True`, `true` all work)
- `enum` validator: case-sensitive (`"production"` does not match `"Production"`)

---

## Programmatic API

### `validateEnv(schema, env?)`

```ts
import { validateEnv } from '@vvantol2000/env-check';

const env = validateEnv(schema);
// or with a custom env object:
const env = validateEnv(schema, { PORT: '3000', DATABASE_URL: 'https://...' });
```

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `schema` | `EnvSchema` | Yes | Schema definition (see below) |
| `env` | `Record<string, string \| undefined>` | No | Object to validate. Defaults to `process.env` |

**Returns:** Typed object matching the schema.

**Throws:** `Error` with all validation failures listed together.

---

## Schema Definition

Each key in the schema defines one environment variable.

```ts
{
  DATABASE_URL: { type: 'url', required: true },
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'enum', values: ['development', 'production'], default: 'development' },
  OPTIONAL_KEY: { type: 'string', required: false },
}
```

### Schema Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `type` | `string` | (required) | Validator type (see below) |
| `required` | `boolean` | `true`* | Throws when missing. *Defaults to `true` only when no `default` is set |
| `default` | `string \| number \| boolean` | — | Fallback value when the variable is missing or empty |
| `values` | `string[]` | — | Allowed values. **Only used with `enum` type** |

---

## Validators

| Type | What it checks | Example input | Parsed as |
|---|---|---|---|
| `string` | Non-empty string | `"my-app"` | `string` |
| `url` | Valid HTTP/HTTPS URL | `"https://api.example.com"` | `string` |
| `number` | Parses as a finite number | `"3000"` | `number` |
| `email` | Matches `user@domain.tld` | `"admin@example.com"` | `string` |
| `boolean` | `true`, `false`, `1`, or `0` | `"true"` | `boolean` |
| `enum` | Value in the `values` list | `"production"` | `string` |

### URL validator details

- Accepts `http://` and `https://` protocols only
- Rejects `ftp://`, `file://`, relative paths, and malformed URLs
- Uses the built-in `URL` constructor

### Number validator details

- Parses strings like `"3000"`, `"3.14"`, `"-1"`
- Rejects `"Infinity"`, `"NaN"`, `"abc"`, `""`
- Returns a JavaScript `number`

### Boolean validator details

- Accepts (case-insensitive): `"true"`, `"false"`, `"1"`, `"0"`
- Returns a JavaScript `boolean`

### Email validator details

- Checks for `user@domain.tld` pattern
- Simple regex, not RFC 5322 compliant (good enough for most apps)

### Enum validator details

- Exact match against the `values` array
- Case-sensitive

---

## CLI Usage

### Create a schema file

Create a JSON file defining your expected env vars:

```json
// env.schema.json
{
  "DATABASE_URL": { "type": "url", "required": true },
  "PORT": { "type": "number", "default": 3000 },
  "NODE_ENV": { "type": "enum", "values": ["development", "production", "test"], "default": "development" },
  "ADMIN_EMAIL": { "type": "email", "required": true },
  "APP_SECRET": { "type": "string", "required": true },
  "DEBUG": { "type": "boolean", "default": false }
}
```

### Install globally (optional)

```bash
npm install -g @vvantol2000/env-check
env-check --schema env.schema.json
```

### Or use with npx

```bash
npx @vvantol2000/env-check --schema env.schema.json
```

### Validate a .env file

```bash
npx @vvantol2000/env-check --schema env.schema.json --env .env.production
```

### CLI Options

| Flag | Description |
|---|---|
| `--schema <path>` | Path to JSON schema file (required) |
| `--env <path>` | Path to `.env` file to validate (default: `process.env`) |
| `--help`, `-h` | Show help |

### Example output (all valid)

```
env-check: all variables valid
  ✓ DATABASE_URL=https://db.example.com
  ✓ PORT=3000
  ✓ NODE_ENV=development
  ✓ ADMIN_EMAIL=admin@example.com
  ✓ APP_SECRET=••••••
  ✓ DEBUG=false
```

Secrets (`SECRET`, `KEY`, `PASSWORD` in the name) are masked with `••••••`.

### Example output (errors)

```
env-check failed:
  ✗ DATABASE_URL is required but missing
  ✗ PORT must be a number (got "abc")
  ✗ ADMIN_EMAIL must be a valid email (got "not-an-email")
```

Exit code is `1` on failure, `0` on success.

---

## .env File Format

When using `--env <path>`, the file should follow standard `.env` format:

```bash
# Comments are ignored
DATABASE_URL=https://db.example.com
PORT=3000
ADMIN_EMAIL=admin@example.com
DEBUG=true
APP_SECRET="quotes-are-stripped"
```

- Lines starting with `#` are ignored
- Empty lines are ignored
- Quotes around values are stripped automatically
- Inline comments are **not** supported (`KEY=value # comment` would include `# comment`)

---

## Error Messages

All errors show the variable name, what was expected, and what was received.

| Scenario | Error |
|---|---|
| Missing required var | `DATABASE_URL is required but missing` |
| Invalid URL | `API_URL must be a valid URL (got "not-a-url")` |
| Invalid number | `PORT must be a number (got "abc")` |
| Invalid email | `ADMIN_EMAIL must be a valid email (got "oops")` |
| Invalid boolean | `DEBUG must be a boolean (true/false/1/0) (got "yes")` |
| Invalid enum | `NODE_ENV must be one of: development, production (got "staging")` |

Multiple errors are collected and reported together — you see all problems at once, not one at a time.

---

## Use Cases

### Nuxt / Nitro startup check

Validate env vars when the server starts:

```ts
// server/plugins/env-check.ts
import { validateEnv } from '@vvantol2000/env-check';

export default defineNitroPlugin(() => {
  validateEnv({
    NUXT_PUBLIC_FIREBASE_API_KEY: { type: 'string' },
    NUXT_PUBLIC_FIREBASE_PROJECT_ID: { type: 'string' },
    NUXT_PUBLIC_SITE_URL: { type: 'url' },
  });
});
```

### Express / Node.js

```ts
import express from 'express';
import { validateEnv } from '@vvantol2000/env-check';

const env = validateEnv({
  PORT: { type: 'number', default: 3000 },
  DATABASE_URL: { type: 'url' },
  JWT_SECRET: { type: 'string' },
});

const app = express();
app.listen(env.PORT);
```

### Pre-deploy check in CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Validate environment
  run: npx @vvantol2000/env-check --schema env.schema.json

- name: Build
  run: npm run build
```

### Validate .env file before deploy

```bash
# Check that .env.production has everything your schema expects
npx @vvantol2000/env-check --schema env.schema.json --env .env.production
```

### Programmatic validation with custom env object

```ts
import { validateEnv } from '@vvantol2000/env-check';

// Validate against a specific set of values, not process.env
const env = validateEnv(
  {
    API_KEY: { type: 'string' },
    PORT: { type: 'number', default: 3000 },
  },
  { API_KEY: 'my-key', PORT: '8080' }
);

console.log(env.PORT); // 8080 (number)
```

---

## TypeScript Types

All exported types:

```ts
import type {
  EnvSchema,        // Record<string, EnvField>
  EnvField,         // { type, required?, default?, values? }
  EnvType,          // 'string' | 'url' | 'number' | 'email' | 'boolean' | 'enum'
  ValidatedEnv,     // Mapped type based on schema
  ValidationError,  // { key, message, value? }
} from '@vvantol2000/env-check';
```

### Inferred types

The return type is inferred from your schema:

```ts
const env = validateEnv({
  PORT: { type: 'number' },
  DEBUG: { type: 'boolean' },
  NAME: { type: 'string' },
});

// env.PORT: number
// env.DEBUG: boolean
// env.NAME: string
```

---

## Tests

```bash
pnpm test
```

25 tests covering:
- All 6 validators with valid and invalid inputs
- `required` default behavior
- `required: false` explicitly
- Default values when missing
- Empty string handling
- Multiple errors collected together
- Mixed schemas
- CLI integration (against real .env files)

---

## License

MIT
