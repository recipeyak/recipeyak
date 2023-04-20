import { useQuery } from "@tanstack/react-query"

import { getTeamMembers } from "@/api"
import { unwrapResult } from "@/query"

export function useTeamMembersList({ teamId }: { teamId: number }) {
  return useQuery({
    queryKey: [teamId, "team-members-list"],
    queryFn: () => getTeamMembers(teamId).then(unwrapResult),
  })
}
