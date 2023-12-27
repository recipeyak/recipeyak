import {
  MutationObserverResult,
  UseMutateFunction,
  UseQueryResult,
} from "@tanstack/react-query"

type Override<A, B> = {
  [K in keyof A]: K extends keyof B ? B[K] : A[K]
}

// 0. infer return type so instead of
//  ResponseFromUse<ReturnType<typeof useQuery>>, we do
//  ResponseFromUse<typeof useQuery>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseFromUse<T> = T extends (...args: any[]) => infer U
  ? // 1. check for useQuery case
    U extends UseQueryResult<infer TData, unknown>
    ? TData
    : // 2. otherwise check for useMutation case
      U extends Override<
          MutationObserverResult<infer UData, unknown, unknown, unknown>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { mutate: UseMutateFunction<infer UData, any, any, any> }
        >
      ? UData
      : // 3. otherwise we didn't find anything
        never
  : never

export type PickVariant<T, TypeName extends string> = T extends {
  type: TypeName
}
  ? T
  : never
