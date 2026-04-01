# @vvantol2000/env-check

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

```bash
npm install @vvantol2000/env-check
```

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
console.log(env.PORT);          // 3000
console.log(env.DEBUG);         // false
```

---

## Programmatic API

### `validateEnv(schema, env?)`

Validates `process.env` (or a provided object) against a schema.

```ts
const env = validateEnv(schema, customEnvObject);
```

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `schema` | `EnvSchema` | Yes | Schema definition (see below) |
| `env` | `Record<string, string \| undefined>` | No | Object to validate. Defaults to `process.env` |

**Returns:** Typed object matching the schema.

**Throws:** `Error` with all validation failures listed.

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

| Property | Type | Description |
|---|---|---|
| `type` | `string` | Validator type (see below) |
| `required` | `boolean` | If `true`, throws when missing. Defaults to `true` when no `default` is set |
| `default` | `string \| number \| boolean` | Fallback value when the variable is missing or empty |
| `values` | `string[]` | Allowed values. **Only used with `enum` type** |

---

## Validators

| Type | What it checks | Example value | Parsed as |
|---|---|---|---|
| `string` | Non-empty string | `"my-app"` | `string` |
| `url` | Valid HTTP/HTTPS URL | `"https://api.example.com"` | `string` |
| `number` | Parses as a finite number | `"3000"` | `number` |
| `email` | Matches `user@domain.tld` | `"admin@example.com"` | `string` |
| `boolean` | `true`, `false`, `1`, or `0` | `"true"` | `boolean` |
| `enum` | Value in the `values` list | `"production"` | `string` |

---

## CLI Usage

### Create a schema file

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

### Run validation

```bash
# Validate against process.env
npx @vvantol2000/env-check --schema env.schema.json

# Validate against a .env file
npx @vvantol2000/env-check --schema env.schema.json --env .env.production
```

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

Exit code is `1` on failure.

---

## CLI Options

| Flag | Description |
|---|---|
| `--schema <path>` | Path to JSON schema file (required) |
| `--env <path>` | Path to `.env` file to validate (default: `process.env`) |
| `--help` | Show help |

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

Multiple errors are collected and reported together.

---

## Use Cases

### Nuxt startup check

```ts
// server/plugins/env-check.ts
import { validateEnv } from '@vvantol2000/env-check';

export default defineNitroPlugin(() => {
  validateEnv({
    NUXT_PUBLIC_FIREBASE_API_KEY: { type: 'string', required: true },
    NUXT_PUBLIC_FIREBASE_PROJECT_ID: { type: 'string', required: true },
    NUXT_PUBLIC_SITE_URL: { type: 'url', required: true },
  });
});
```

### Express/Node startup

```ts
import { validateEnv } from '@vvantol2000/env-check';

const env = validateEnv({
  PORT: { type: 'number', default: 3000 },
  DATABASE_URL: { type: 'url', required: true },
  JWT_SECRET: { type: 'string', required: true },
});

app.listen(env.PORT);
```

### CI/CD pipeline

```bash
# In your GitHub Action or CI script — fail before building
npx @vvantol2000/env-check --schema env.schema.json
npm run build
```

### Validate a .env file before deploy

```bash
# Check .env.production has everything needed
npx @vvantol2000/env-check --schema env.schema.json --env .env.production
```

---

## Integration Tests

```bash
pnpm test
```

19 tests covering all validators, default values, missing vars, type coercion, and mixed schemas.

---

## License

MIT
