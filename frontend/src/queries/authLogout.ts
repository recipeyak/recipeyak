import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useHistory } from "react-router-dom"

import { logout } from "@/auth"
import { http } from "@/http"
import { unwrapResult } from "@/query"

const logoutUser = () => http.post<void>("/api/v1/auth/logout/", {})

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
