import { UseQueryResult } from "@tanstack/react-query"

export type ResponseFromUseQuery<T> = T extends UseQueryResult<
  infer TData,
  unknown
>
  ? TData
  : never
