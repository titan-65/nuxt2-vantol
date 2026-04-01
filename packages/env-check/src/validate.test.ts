import { describe, it, expect } from 'vitest';
import { validateEnv } from './validate';

describe('validateEnv', () => {
  it('passes when all required vars are present', () => {
    const result = validateEnv(
      { API_URL: { type: 'url', required: true } },
      { API_URL: 'https://example.com' },
    );
    expect(result.API_URL).toBe('https://example.com');
  });

  it('throws when required var is missing', () => {
    expect(() =>
      validateEnv(
        { API_URL: { type: 'url', required: true } },
        {},
      ),
    ).toThrow('API_URL is required but missing');
  });

  it('uses default when var is missing', () => {
    const result = validateEnv(
      { PORT: { type: 'number', default: 3000 } },
      {},
    );
    expect(result.PORT).toBe(3000);
  });

  it('uses default when var is empty string', () => {
    const result = validateEnv(
      { PORT: { type: 'number', default: 8080 } },
      { PORT: '' },
    );
    expect(result.PORT).toBe(8080);
  });

  it('returns undefined for optional vars with no default', () => {
    const result = validateEnv(
      { DEBUG: { type: 'string', required: false } },
      {},
    );
    expect(result.DEBUG).toBeUndefined();
  });

  it('validates URL type', () => {
    const result = validateEnv(
      { API_URL: { type: 'url', required: true } },
      { API_URL: 'https://example.com' },
    );
    expect(result.API_URL).toBe('https://example.com');
  });

  it('rejects invalid URL', () => {
    expect(() =>
      validateEnv(
        { API_URL: { type: 'url', required: true } },
        { API_URL: 'not-a-url' },
      ),
    ).toThrow('API_URL must be a valid URL');
  });

  it('validates number type', () => {
    const result = validateEnv(
      { PORT: { type: 'number', required: true } },
      { PORT: '3000' },
    );
    expect(result.PORT).toBe(3000);
  });

  it('rejects invalid number', () => {
    expect(() =>
      validateEnv(
        { PORT: { type: 'number', required: true } },
        { PORT: 'abc' },
      ),
    ).toThrow('PORT must be a number');
  });

  it('validates email type', () => {
    const result = validateEnv(
      { ADMIN_EMAIL: { type: 'email', required: true } },
      { ADMIN_EMAIL: 'admin@example.com' },
    );
    expect(result.ADMIN_EMAIL).toBe('admin@example.com');
  });

  it('rejects invalid email', () => {
    expect(() =>
      validateEnv(
        { ADMIN_EMAIL: { type: 'email', required: true } },
        { ADMIN_EMAIL: 'not-an-email' },
      ),
    ).toThrow('ADMIN_EMAIL must be a valid email');
  });

  it('validates boolean type', () => {
    const result = validateEnv(
      { DEBUG: { type: 'boolean', required: true } },
      { DEBUG: 'true' },
    );
    expect(result.DEBUG).toBe(true);
  });

  it('parses boolean 1 as true', () => {
    const result = validateEnv(
      { DEBUG: { type: 'boolean', required: true } },
      { DEBUG: '1' },
    );
    expect(result.DEBUG).toBe(true);
  });

  it('parses boolean false', () => {
    const result = validateEnv(
      { DEBUG: { type: 'boolean', required: true } },
      { DEBUG: 'false' },
    );
    expect(result.DEBUG).toBe(false);
  });

  it('rejects invalid boolean', () => {
    expect(() =>
      validateEnv(
        { DEBUG: { type: 'boolean', required: true } },
        { DEBUG: 'yes' },
      ),
    ).toThrow('DEBUG must be a boolean');
  });

  it('validates enum type', () => {
    const result = validateEnv(
      { NODE_ENV: { type: 'enum', values: ['development', 'production', 'test'], required: true } },
      { NODE_ENV: 'production' },
    );
    expect(result.NODE_ENV).toBe('production');
  });

  it('rejects invalid enum value', () => {
    expect(() =>
      validateEnv(
        { NODE_ENV: { type: 'enum', values: ['development', 'production'], required: true } },
        { NODE_ENV: 'staging' },
      ),
    ).toThrow('NODE_ENV must be one of: development, production');
  });

  it('collects multiple errors', () => {
    expect(() =>
      validateEnv(
        {
          API_URL: { type: 'url', required: true },
          PORT: { type: 'number', required: true },
        },
        {},
      ),
    ).toThrow(/API_URL.*\n.*PORT/);
  });

  it('handles mixed schema', () => {
    const result = validateEnv(
      {
        DATABASE_URL: { type: 'url', required: true },
        PORT: { type: 'number', default: 3000 },
        NODE_ENV: { type: 'enum', values: ['development', 'production'], default: 'development' },
        DEBUG: { type: 'boolean', default: false },
        APP_NAME: { type: 'string', required: true },
      },
      {
        DATABASE_URL: 'https://db.example.com',
        APP_NAME: 'My App',
      },
    );
    expect(result.DATABASE_URL).toBe('https://db.example.com');
    expect(result.PORT).toBe(3000);
    expect(result.NODE_ENV).toBe('development');
    expect(result.DEBUG).toBe(false);
    expect(result.APP_NAME).toBe('My App');
  });

  it('defaults to required when required is omitted and no default', () => {
    expect(() =>
      validateEnv(
        { API_KEY: { type: 'string' } },
        {},
      ),
    ).toThrow('API_KEY is required but missing');
  });

  it('treats required:false explicitly as optional', () => {
    const result = validateEnv(
      { OPTIONAL: { type: 'string', required: false } },
      {},
    );
    expect(result.OPTIONAL).toBeUndefined();
  });

  it('treats field with default as not required', () => {
    const result = validateEnv(
      { PORT: { type: 'number', default: 8080 } },
      {},
    );
    expect(result.PORT).toBe(8080);
  });
});
