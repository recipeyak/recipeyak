import { useQuery } from "@tanstack/react-query"

import { getTeamList } from "@/api"
import { unwrapResult } from "@/query"

export function useTeamList() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeamList().then(unwrapResult),
  })
}
