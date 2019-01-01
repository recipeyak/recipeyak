export const enum RDK {
  NotAsked,
  Loading,
  Failure,
  Success
}

interface ILoading {
  readonly kind: RDK.Loading
}

interface IFailure<E> {
  readonly kind: RDK.Failure
  readonly failure: E
}

export interface ISuccess<T> {
  readonly kind: RDK.Success
  readonly data: T
}

type RemoteData<E, T> = undefined | ILoading | IFailure<E> | ISuccess<T>

export type WebData<T> = RemoteData<HttpErrorKind, T>

export const enum HttpErrorKind {
  error404,
  other
}

// for now we have to specify the type guard
// see https://github.com/Microsoft/TypeScript/issues/16069
export const isSuccess = <T>(x: WebData<T>): x is ISuccess<T> =>
  x != null && x.kind === RDK.Success
