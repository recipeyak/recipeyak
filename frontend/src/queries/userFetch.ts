import { useQuery } from "@tanstack/react-query"

import { getUser } from "@/api"
import { useDispatch } from "@/hooks"
import { unwrapResult } from "@/query"
import { cacheUserInfo } from "@/store/reducers/user"

export function useUserFetch() {
  // TODO: this api call could be removed with a preload
  const dispatch = useDispatch()
  return useQuery(["user-detail"], () => getUser().then(unwrapResult), {
    onSuccess: (res) => {
      dispatch(cacheUserInfo(res))
    },
  })
}
