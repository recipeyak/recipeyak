import { useMutation } from "@tanstack/react-query"
import { useDispatch } from "react-redux"
import { useHistory } from "react-router-dom"

import { logoutUser } from "@/api"
import { unwrapResult } from "@/query"
import { cacheUserInfo } from "@/store/reducers/user"

export function useAuthLogout() {
  const history = useHistory()
  const dispatch = useDispatch()
  return useMutation({
    mutationFn: () => logoutUser().then(unwrapResult),
    onSuccess: () => {
      dispatch(cacheUserInfo(null))
      history.push("/login")
    },
  })
}
