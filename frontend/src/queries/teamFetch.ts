import { QueryClient, useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { unwrapResult } from "@/query"

const getTeam = (id: number) => http.get<{ name: string }>(`/api/v1/t/${id}/`)

export function useTeam({ teamId }: { teamId: number }) {
  return useQuery({
    queryKey: getQueryKey({ teamId }),
    queryFn: () => getTeam(teamId).then(unwrapResult),
  })
}

function getQueryKey({ teamId }: { teamId: number }) {
  return ["teams", teamId] as const
}

type TeamFetchResponse = ResponseFromUse<typeof useTeam>

export function setQueryDataTeam(
  client: QueryClient,
  {
    teamId,
    updater,
  }: {
    teamId: number
    updater: (
      prev: TeamFetchResponse | undefined,
    ) => TeamFetchResponse | undefined
  },
) {
  client.setQueryData<TeamFetchResponse>(getQueryKey({ teamId }), updater)
}
