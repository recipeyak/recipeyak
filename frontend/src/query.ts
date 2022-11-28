import { Either, isRight } from "fp-ts/lib/Either"

import { isOk, Result } from "@/result"

export function unwrapEither<T>(x: Either<unknown, T>): T {
  if (isRight(x)) {
    return x.right
  }
  throw x.left
}

export function unwrapResult<T, E>(x: Result<T, E>): T {
  if (isOk(x)) {
    return x.data
  }
  throw x.error
}
