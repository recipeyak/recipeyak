import { QueryClient, useQuery } from "@tanstack/react-query"

import { teamRetrieve } from "@/api/teamRetrieve"
import { ResponseFromUse } from "@/queries/queryUtilTypes"

export function useTeam({ teamId }: { teamId: number }) {
  return useQuery({
    queryKey: getQueryKey({ teamId }),
    queryFn: () => teamRetrieve({ team_id: teamId }),
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
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<TeamFetchResponse>(getQueryKey({ teamId }), updater)
}
