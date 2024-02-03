import { useQuery } from "@tanstack/react-query"

import { sessionList } from "@/api/sessionList"
import { ResponseFromUse } from "@/queries/queryUtilTypes"

export type ISession = ResponseFromUse<typeof useSessionList>[number]

export function useSessionList() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionList(),
  })
}
