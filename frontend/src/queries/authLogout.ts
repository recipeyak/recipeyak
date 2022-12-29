import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useHistory } from "react-router-dom"

import { logoutUser } from "@/api"
import { logout } from "@/auth"
import { unwrapResult } from "@/query"

export function useAuthLogout() {
  const history = useHistory()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => logoutUser().then(unwrapResult),
    onSuccess: () => {
      logout(queryClient)
      history.push("/login")
    },
  })
}
