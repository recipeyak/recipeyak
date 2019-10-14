const enum RDK {
  Loading,
  Failure,
  Success,
  Refetching
}

export interface ILoading {
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

export interface IRefetching<T> {
  readonly kind: RDK.Refetching
  readonly data: T
}

export function Refetching<T>(data: T): IRefetching<T> {
  return {
    kind: RDK.Refetching,
    data
  }
}

type RemoteData<E, T> =
  | undefined
  | ILoading
  | IFailure<E>
  | ISuccess<T>
  | IRefetching<T>

// TODO(chdsbd): Make the default error type void
export type WebData<T = void, E = HttpErrorKind | undefined> = RemoteData<E, T>

export const enum HttpErrorKind {
  error404,
  other
}

// for now we have to specify the type guard
// see https://github.com/Microsoft/TypeScript/issues/16069
export const isSuccess = <T, E>(x: WebData<T, E>): x is ISuccess<T> =>
  x != null && x.kind === RDK.Success

export const isLoading = <T, E>(x: WebData<T, E>): x is ILoading =>
  x != null && x.kind === RDK.Loading

export const isInitial = <T, E>(x: WebData<T, E>): x is undefined => x == null

export const isFailure = <T, E>(x: WebData<T, E>): x is IFailure<E> =>
  x != null && x.kind === RDK.Failure

export const isRefetching = <T, E>(x: WebData<T, E>): x is IRefetching<T> =>
  x != null && x.kind === RDK.Refetching

export const isSuccessOrRefetching = <T, E>(
  x: WebData<T, E>
): x is ISuccess<T> | IRefetching<T> => isSuccess(x) || isRefetching(x)

export const isSuccessLike = isSuccessOrRefetching

export const unWrap = <T>(d: ISuccess<T> | IRefetching<T>): T => d.data

/** map over WebData with @param func if data is a type structurally similar to Success */
export function mapSuccessLike<T, R, E>(
  d: WebData<T, E>,
  func: (data: T) => R
): WebData<R, E> {
  if (isSuccessOrRefetching(d)) {
    return { ...d, data: func(unWrap(d)) }
  }
  return d
}

/** handle transitioning from Success & InitialState to Loading */
export function toLoading<T, E>(
  state: WebData<T, E>
): IRefetching<T> | ILoading {
  if (isSuccess(state)) {
    return Refetching(unWrap(state))
  }
  return Loading()
}
