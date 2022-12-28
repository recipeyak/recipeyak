import { useQuery } from "@tanstack/react-query"

import { getTeamMembers } from "@/api"
import { unwrapResult } from "@/query"

export function useTeamMembersList({ teamId }: { teamId: number }) {
  // TODO: this key should probably be refactored
  return useQuery(["team-members-list", teamId], () =>
    getTeamMembers(teamId).then(unwrapResult),
  )
}
