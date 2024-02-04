import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useHistory } from "react-router-dom"

import { userLogout } from "@/api/userLogout"
import { logout } from "@/auth"

export function useAuthLogout() {
  const history = useHistory()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userLogout,
    onSuccess: () => {
      logout(queryClient)
      history.push("/login")
    },
  })
}
