/**
 * Utility types for Danos Aparentes.
 *
 * Use these instead of ad-hoc conditional/mapped types in components.
 */

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type Nullable<T> = T | null;

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type ExtractDamageSeverity<T> = T extends { severity: infer S }
  ? S
  : never;

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type AppError = {
  kind: 'validation' | 'network' | 'auth' | 'unknown';
  message: string;
  cause?: unknown;
  context?: Record<string, unknown>;
};
