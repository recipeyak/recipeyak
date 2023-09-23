import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { ITeam } from "@/queries/teamFetch"
import { unwrapResult } from "@/query"

const getTeamList = () => http.get<ITeam[]>("/api/v1/t/")

export function useTeamList() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeamList().then(unwrapResult),
  })
}
