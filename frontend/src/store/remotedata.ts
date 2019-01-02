const enum RDK {
  Loading,
  Failure,
  Success
}

interface ILoading {
  readonly kind: RDK.Loading
}
export function Loading(): ILoading {
  return { kind: RDK.Loading }
}

interface IFailure<E> {
  readonly kind: RDK.Failure
  readonly failure: E
}

export function Failure<T>(failure: T): IFailure<T> {
  return {
    kind: RDK.Failure,
    failure
  }
}

export interface ISuccess<T> {
  readonly kind: RDK.Success
  readonly data: T
}

export function Success<T>(data: T): ISuccess<T> {
  return {
    kind: RDK.Success,
    data
  }
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

export const isLoading = <T>(x: WebData<T>): x is ILoading =>
  x != null && x.kind === RDK.Loading

export const isInitial = <T>(x: WebData<T>): x is undefined => x == null

export const isFailure = <T>(x: WebData<T>): x is IFailure<HttpErrorKind> =>
  x == null
