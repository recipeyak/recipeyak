import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"

import { userRetrieve } from "@/api/userRetrieve"
import { setUser } from "@/auth"
import { takeBootstrapUser } from "@/bootstrap"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"

export function useUserFetch() {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: getQueryKey(),
    queryFn: async () => {
      const res = takeBootstrapUser() ?? (await userRetrieve())
      setUser(res, queryClient)
      return res
    },
  })
}

function getQueryKey() {
  return ["user-detail"]
}

type UserFetchResponse = ResponseFromUse<typeof useUserFetch>

export function cacheUpsertUser(
  client: QueryClient,
  {
    updater,
  }: {
    updater: (
      prev: UserFetchResponse | undefined,
    ) => UserFetchResponse | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<UserFetchResponse>(getQueryKey(), updater)
}
