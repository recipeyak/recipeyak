import { useQuery } from "@tanstack/react-query"

import { teamList } from "@/api/teamList"

export function useTeamList() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: teamList,
  })
}
