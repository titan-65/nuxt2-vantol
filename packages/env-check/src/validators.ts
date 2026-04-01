export function isNonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isNumber(value: string): boolean {
  const n = Number(value);
  return !isNaN(n) && isFinite(n);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isBoolean(value: string): boolean {
  return ['true', 'false', '1', '0'].includes(value.toLowerCase());
}

export function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true' || value === '1';
}

export function isEnum(value: string, values: string[]): boolean {
  return values.includes(value);
}
