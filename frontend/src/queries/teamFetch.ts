import { useQuery } from "@tanstack/react-query"

import { getTeam } from "@/api"
import { unwrapResult } from "@/query"

export function useTeam({ teamId }: { teamId: number }) {
  return useQuery(["teams", teamId], () => getTeam(teamId).then(unwrapResult))
}
