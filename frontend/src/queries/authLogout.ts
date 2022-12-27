import { useMutation } from "@tanstack/react-query"
import raven from "raven-js"
import { useDispatch } from "react-redux"
import { useHistory } from "react-router-dom"

import { logoutUser } from "@/api"
import { unwrapResult } from "@/query"
import { setUserLoggedIn } from "@/store/reducers/user"

export function useAuthLogout() {
  const history = useHistory()
  const dispatch = useDispatch()
  return useMutation({
    mutationFn: () => logoutUser().then(unwrapResult),
    onSuccess: () => {
      raven.setUserContext()
      dispatch(setUserLoggedIn(false))
      history.push("/login")
    },
  })
}
