export function notUndefined<T>(x: T | undefined): x is T {
  return x != null
}
/**
 * Throws if value is undefined
 */
export function assertNotNullish<T>(x: T | undefined): asserts x is T {
  if (x == null) {
    throw Error("Expected value to be not-nullish")
  }
}
