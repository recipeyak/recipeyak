import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"

import { userRetrieve } from "@/api/userRetrieve"
import { login } from "@/auth"
import { ResponseFromUse } from "@/queries/queryUtilTypes"

export function useUserFetch() {
  // TODO: this api call could be removed with a preload
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: getQueryKey(),
    queryFn: async () => {
      const res = await userRetrieve()
      login(res, queryClient)
      return res
    },
  })
}

function getQueryKey() {
  return ["user-detail"]
}

type UserFetchResponse = ResponseFromUse<typeof useUserFetch>

export function setQueryDataUser(
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
