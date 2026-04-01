# @vvantol2000/env-check

Validate environment variables against a schema with clear error messages. Fail fast at startup.

## Install

```bash
npm install @vvantol2000/env-check
```

## Programmatic Usage

```ts
import { validateEnv } from '@vvantol2000/env-check';

const env = validateEnv({
  DATABASE_URL: { type: 'url', required: true },
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'enum', values: ['development', 'production', 'test'], default: 'development' },
  ADMIN_EMAIL: { type: 'email', required: true },
  APP_SECRET: { type: 'string', required: true },
  DEBUG: { type: 'boolean', default: false },
});

// If all valid, returns typed object:
// { DATABASE_URL: 'https://...', PORT: 3000, NODE_ENV: 'development', ... }

// If invalid, throws:
// env-check failed:
//   ✗ DATABASE_URL is required but missing
//   ✗ PORT must be a number (got "abc")
```

## CLI Usage

Create a JSON schema file:

```json
// env.schema.json
{
  "DATABASE_URL": { "type": "url", "required": true },
  "PORT": { "type": "number", "default": 3000 },
  "NODE_ENV": { "type": "enum", "values": ["development", "production"], "default": "development" }
}
```

Run validation:

```bash
# Validate against process.env
npx env-check --schema env.schema.json

# Validate against a .env file
npx env-check --schema env.schema.json --env .env.production
```

## Validators

| Type | Validates |
|---|---|
| `string` | Non-empty string |
| `url` | Valid HTTP/HTTPS URL |
| `number` | Parses as a finite number |
| `email` | Matches `user@domain.tld` pattern |
| `boolean` | `true`, `false`, `1`, or `0` |
| `enum` | Value in the `values` list |

## Schema Fields

| Property | Type | Description |
|---|---|---|
| `type` | `string` | One of the validators above |
| `required` | `boolean` | Must be present (default: `true` when no `default`) |
| `default` | `string \| number \| boolean` | Fallback value when missing |
| `values` | `string[]` | Allowed values (only for `enum` type) |

## License

MIT
