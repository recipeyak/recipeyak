import { useMutation } from "@tanstack/react-query"
import raven from "raven-js"
import { useHistory } from "react-router-dom"

import { logoutUser } from "@/api"
import { unwrapResult } from "@/query"

export function useAuthLogout() {
  const history = useHistory()
  return useMutation({
    mutationFn: () => logoutUser().then(unwrapResult),
    onSuccess: () => {
      raven.setUserContext()
      history.push("/login")
    },
  })
}
