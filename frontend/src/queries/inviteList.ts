import { QueryClient, useQuery } from "@tanstack/react-query"

import { inviteList } from "@/api/inviteList"
import { ResponseFromUse } from "@/queries/queryUtilTypes"

export function useInviteList() {
  return useQuery({
    queryKey: getQueryKey(),
    queryFn: inviteList,
  })
}

function getQueryKey() {
  return ["invites"] as const
}

type InviteListResponse = ResponseFromUse<typeof useInviteList>

export function cacheUpsertInviteList(
  client: QueryClient,
  {
    updater,
  }: {
    updater: (
      prev: InviteListResponse | undefined,
    ) => InviteListResponse | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<InviteListResponse>(getQueryKey(), updater)
}
