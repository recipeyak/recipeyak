const enum IResultKind {
    Ok,
    Err
}

export interface IOk<T> {
    readonly kind: IResultKind.Ok
    readonly data: T
}

export interface IErr<E> {
    readonly kind: IResultKind.Err
    readonly error: E
}

export function Ok<T>(data: T): IOk<T> {
    return {
        kind: IResultKind.Ok,
        data
    }
}

export function Err<T>(error: T): IErr<T> {
    return {
        kind: IResultKind.Err,
        error
    }
}

export type Result<T, E> = IOk<T> | IErr<E>

export const isOk = <T, E>(x: Result<T, E>): x is IOk<T> =>
    x.kind === IResultKind.Ok
export const isErr = <T, E>(x: Result<T, E>): x is IErr<E> =>
    x.kind === IResultKind.Err
