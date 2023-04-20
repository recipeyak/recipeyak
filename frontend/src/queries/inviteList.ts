import { useQuery } from "@tanstack/react-query"

import { getInviteList } from "@/api"
import { unwrapResult } from "@/query"

export function useInviteList() {
  return useQuery({
    queryKey: ["invites"],
    queryFn: () => getInviteList().then(unwrapResult),
  })
}
