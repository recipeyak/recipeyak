import { Either, isRight } from "fp-ts/lib/Either"

export function unwrapEither<T>(x: Either<unknown, T>): T {
  if (isRight(x)) {
    return x.right
  }
  throw x.left
}
