import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateUser } from "@/api"
import { useDispatch } from "@/hooks"
import { unwrapResult } from "@/query"
import { cacheUserInfo, IUser } from "@/store/reducers/user"

export function useUserUpdate() {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  return useMutation({
    mutationFn: (payload: { email?: string; name?: string }) =>
      updateUser(payload).then(unwrapResult),
    onSuccess: (res) => {
      dispatch(cacheUserInfo(res))
      queryClient.setQueryData(["user-detail"], (): IUser | undefined => {
        return res
      })
    },
  })
}
