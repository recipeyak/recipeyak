import { QueryClient, useQuery } from "@tanstack/react-query"

import { sessionList } from "@/api/sessionList"
import { ResponseFromUse } from "@/queries/queryUtilTypes"

export type ISession = ResponseFromUse<typeof useSessionList>[number]

export function useSessionList() {
  return useQuery({
    queryKey: getQueryKey(),
    queryFn: () => sessionList(),
  })
}

function getQueryKey() {
  return ["sessions"]
}

export function cacheUpsertSession(
  client: QueryClient,
  {
    updater,
  }: {
    updater: (
      prev: readonly ISession[] | undefined,
    ) => readonly ISession[] | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<readonly ISession[]>(getQueryKey(), updater)
}
