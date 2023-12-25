import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"

import { login } from "@/auth"
import { http } from "@/http"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { unwrapResult } from "@/query"
import { Theme, ThemeMode } from "@/themeConstants"

const getUser = () =>
  http.get<{
    readonly id: number
    readonly name: string
    readonly avatar_url: string
    readonly email: string
    readonly theme_day: Theme
    readonly theme_night: Theme
    readonly theme_mode: ThemeMode
    readonly schedule_team: number | null
  }>("/api/v1/user/")

export function useUserFetch() {
  // TODO: this api call could be removed with a preload
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: getQueryKey(),
    queryFn: async () => {
      const res = await getUser().then(unwrapResult)
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
  client.setQueryData<UserFetchResponse>(getQueryKey(), updater)
}
