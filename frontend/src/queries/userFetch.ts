import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getUser } from "@/api"
import { login } from "@/auth"
import { unwrapResult } from "@/query"

export function useUserFetch() {
  // TODO: this api call could be removed with a preload
  const queryClient = useQueryClient()
  return useQuery(["user-detail"], () => getUser().then(unwrapResult), {
    onSuccess: (res) => {
      login(res, queryClient)
    },
  })
}
