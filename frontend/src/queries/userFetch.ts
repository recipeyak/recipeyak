import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getUser, IUser } from "@/api"
import { login } from "@/auth"
import { unwrapResult } from "@/query"

export function useUserFetch({
  onSuccess,
}: {
  onSuccess?: (data: IUser) => void
} = {}) {
  // TODO: this api call could be removed with a preload
  const queryClient = useQueryClient()
  return useQuery(["user-detail"], () => getUser().then(unwrapResult), {
    onSuccess: (res) => {
      login(res, queryClient)
      onSuccess?.(res)
    },
  })
}
