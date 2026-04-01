import type { EnvSchema, ValidatedEnv, ValidationError } from './types';
import {
  isNonEmpty,
  isValidUrl,
  isNumber,
  isEmail,
  isBoolean,
  parseBoolean,
  isEnum,
} from './validators';

export function validateEnv<T extends EnvSchema>(
  schema: T,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): ValidatedEnv<T> {
  const errors: ValidationError[] = [];
  const result: Record<string, unknown> = {};

  for (const [key, field] of Object.entries(schema)) {
    const raw = env[key];

    // Missing value
    if (!isNonEmpty(raw)) {
      if (field.default !== undefined) {
        result[key] = field.default;
        continue;
      }
      if (field.required === true) {
        errors.push({
          key,
          message: `${key} is required but missing`,
        });
        continue;
      }
      result[key] = undefined;
      continue;
    }

    // Validate based on type
    switch (field.type) {
      case 'string': {
        result[key] = raw;
        break;
      }
      case 'url': {
        if (!isValidUrl(raw)) {
          errors.push({
            key,
            message: `${key} must be a valid URL (got "${raw}")`,
            value: raw,
          });
        } else {
          result[key] = raw;
        }
        break;
      }
      case 'number': {
        if (!isNumber(raw)) {
          errors.push({
            key,
            message: `${key} must be a number (got "${raw}")`,
            value: raw,
          });
        } else {
          result[key] = Number(raw);
        }
        break;
      }
      case 'email': {
        if (!isEmail(raw)) {
          errors.push({
            key,
            message: `${key} must be a valid email (got "${raw}")`,
            value: raw,
          });
        } else {
          result[key] = raw;
        }
        break;
      }
      case 'boolean': {
        if (!isBoolean(raw)) {
          errors.push({
            key,
            message: `${key} must be a boolean (true/false/1/0) (got "${raw}")`,
            value: raw,
          });
        } else {
          result[key] = parseBoolean(raw);
        }
        break;
      }
      case 'enum': {
        if (!field.values || !isEnum(raw, field.values)) {
          errors.push({
            key,
            message: `${key} must be one of: ${field.values?.join(', ')} (got "${raw}")`,
            value: raw,
          });
        } else {
          result[key] = raw;
        }
        break;
      }
      default: {
        result[key] = raw;
      }
    }
  }

  if (errors.length > 0) {
    const messages = errors.map((e) => `  ✗ ${e.message}`).join('\n');
    throw new Error(`env-check failed:\n${messages}`);
  }

  return result as ValidatedEnv<T>;
}
