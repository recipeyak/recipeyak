import { useQuery } from "@tanstack/react-query"

import { getSessions } from "@/api"
import { unwrapResult } from "@/query"

export function useSessionList() {
  // TODO: key should be like `[teamId, userId, ...]
  return useQuery(["sessions"], () => getSessions().then(unwrapResult))
}
