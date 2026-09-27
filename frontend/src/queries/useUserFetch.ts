import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"

import { userRetrieve } from "@/api/userRetrieve"
import { login } from "@/auth"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"

export function useUserFetch() {
  // TODO: this api call could be removed with a preload
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: getQueryKey(),
    queryFn: async () => {
      const res = await userRetrieve()
      void login(res, queryClient, { refreshRealtimeAuth: false })
      return res
    },
    // The app waits for the user to load before rendering, so without this
    // every component that mounts afterwards would immediately refetch it.
    staleTime: 60 * 1000,
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
