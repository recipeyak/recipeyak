import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

const getTeamList = () =>
  http.get<{ id: number; name: string; created: string; members: number }[]>(
    "/api/v1/t/",
  )

export function useTeamList() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeamList().then(unwrapResult),
  })
}
