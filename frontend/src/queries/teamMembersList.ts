import { QueryClient, useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { ResponseFromUseQuery } from "@/queries/queryUtilTypes"
import { unwrapResult } from "@/query"

const getTeamMembers = (id: number) =>
  http.get<
    Array<{
      readonly id: number
      readonly created: string
      readonly level: "admin" | "contributor" | "read"
      readonly user: {
        readonly id: number
        readonly name: string | null
        readonly avatar_url: string
        readonly email: string
      }
    }>
  >(`/api/v1/t/${id}/members/`)

export function useTeamMembersList({ teamId }: { teamId: number }) {
  return useQuery({
    queryKey: getQueryKey({ teamId }),
    queryFn: () => getTeamMembers(teamId).then(unwrapResult),
  })
}

function getQueryKey({ teamId }: { teamId: number }) {
  return [teamId, "team-members-list"] as const
}

type Response = ResponseFromUseQuery<ReturnType<typeof useTeamMembersList>>

export function setQueryDataTeamMemberList(
  client: QueryClient,
  {
    teamId,
    updater,
  }: {
    teamId: number
    updater: (prev: Response | undefined) => Response | undefined
  },
) {
  client.setQueryData<Response>(getQueryKey({ teamId }), updater)
}
