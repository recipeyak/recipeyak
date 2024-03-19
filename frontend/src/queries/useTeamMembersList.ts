import { QueryClient, useQuery } from "@tanstack/react-query"

import { memberList } from "@/api/memberList"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"

export function useTeamMembersList({ teamId }: { teamId: number }) {
  return useQuery({
    queryKey: getQueryKey({ teamId }),
    queryFn: () => memberList({ team_id: teamId }),
  })
}

function getQueryKey({ teamId }: { teamId: number }) {
  return [teamId, "team-members-list"] as const
}

type TeamMemberListResponse = ResponseFromUse<typeof useTeamMembersList>

export function cacheUpsertTeamMemberList(
  client: QueryClient,
  {
    teamId,
    updater,
  }: {
    teamId: number
    updater: (
      prev: TeamMemberListResponse | undefined,
    ) => TeamMemberListResponse | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<TeamMemberListResponse>(getQueryKey({ teamId }), updater)
}
