export type EnvType = 'string' | 'url' | 'number' | 'email' | 'boolean' | 'enum';

export interface EnvField {
  type: EnvType;
  required?: boolean;
  default?: string | number | boolean;
  values?: string[];
  description?: string;
}

export type EnvSchema = Record<string, EnvField>;

export type ValidatedEnv<T extends EnvSchema> = {
  [K in keyof T]: T[K]['type'] extends 'number'
    ? number
    : T[K]['type'] extends 'boolean'
      ? boolean
      : T[K]['required'] extends true
        ? string
        : T[K]['default'] extends string | number | boolean
          ? string | number | boolean
          : string | undefined;
};

export interface ValidationError {
  key: string;
  message: string;
  value?: string;
}

export interface ValidationResult<T extends EnvSchema> {
  success: boolean;
  env?: ValidatedEnv<T>;
  errors?: ValidationError[];
}
