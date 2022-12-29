import { useQuery } from "@tanstack/react-query"

import { getTeamMembers } from "@/api"
import { unwrapResult } from "@/query"

export function useTeamMembersList({ teamId }: { teamId: number }) {
  return useQuery([teamId, "team-members-list"], () =>
    getTeamMembers(teamId).then(unwrapResult),
  )
}
