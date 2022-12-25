import { useQuery } from "@tanstack/react-query"

import { getInviteList } from "@/api"
import { unwrapResult } from "@/query"

export function useInviteList() {
  // TODO: key should be like `[teamId, userId, ...]
  return useQuery(["invites"], () => getInviteList().then(unwrapResult))
}
