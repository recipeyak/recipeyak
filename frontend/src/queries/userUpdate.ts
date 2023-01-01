import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateUser } from "@/api"
import { login } from "@/auth"
import { unwrapResult } from "@/query"

export function useUserUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      email?: string
      name?: string
      schedule_team?: number
    }) => updateUser(payload).then(unwrapResult),
    onSuccess: (res) => {
      login(res, queryClient)
    },
  })
}
