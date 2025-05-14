export function assertNotNullOrUndefined<T>(
  value: T | null | undefined,
  label?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`${label ?? 'Value'} is null or undefined`);
  }
}
