export function asReceiptShape(data: unknown): boolean {
  return !!data && typeof data === 'object' && typeof (data as { hash?: unknown }).hash === 'string'
}
