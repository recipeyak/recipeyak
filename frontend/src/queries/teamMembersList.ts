import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { IMember, ITeam } from "@/queries/teamFetch"
import { unwrapResult } from "@/query"

const getTeamMembers = (id: ITeam["id"]) =>
  http.get<IMember[]>(`/api/v1/t/${id}/members/`)

export function useTeamMembersList({ teamId }: { teamId: number }) {
  return useQuery({
    queryKey: [teamId, "team-members-list"],
    queryFn: () => getTeamMembers(teamId).then(unwrapResult),
  })
}
