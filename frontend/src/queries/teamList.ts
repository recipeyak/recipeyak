import { useQuery } from "@tanstack/react-query"

import { getTeamList } from "@/api"
import { unwrapResult } from "@/query"

export function useTeamList() {
  // TODO: key should be like `[userId, ...]
  return useQuery(["teams"], () => getTeamList().then(unwrapResult))
}
