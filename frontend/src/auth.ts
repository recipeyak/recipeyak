import { QueryClient } from "@tanstack/react-query"
import raven from "raven-js"

import { IUser } from "@/api"

export function logout(queryClient: QueryClient) {
  queryClient.clear()
  raven.setUserContext()
}

export function login(user: IUser, queryClient: QueryClient) {
  raven.setUserContext({
    email: user.email,
    id: user.id,
  })
  queryClient.setQueryData<IUser>(["user-detail"], () => {
    return user
  })
}
