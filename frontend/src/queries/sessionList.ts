import { useQuery } from "@tanstack/react-query"

import { getSessions } from "@/api"
import { unwrapResult } from "@/query"

export function useSessionList() {
  return useQuery(["sessions"], () => getSessions().then(unwrapResult))
}
