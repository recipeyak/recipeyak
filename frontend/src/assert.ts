export function assertNever(x: never): never {
  throw Error(`expected never, got ${x}`)
}
export function assertNotNullish<T>(x: T | null | undefined): asserts x is T {
  if (x == null) {
    throw Error(`expected never, got ${x}`)
  }
}
