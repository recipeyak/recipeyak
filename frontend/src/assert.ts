export function assertNever(x: never): never {
  throw Error(`expected never, got ${x}`)
}
