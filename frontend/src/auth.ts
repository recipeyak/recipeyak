import { QueryClient } from "@tanstack/react-query"
import raven from "raven-js"

import { IUser } from "@/queries/userFetch"
import { themeSet } from "@/theme"

export function logout(queryClient: QueryClient) {
  queryClient.clear()
  raven.setUserContext()
  themeSet("light")
}

export function login(user: IUser, queryClient: QueryClient) {
  raven.setUserContext({
    email: user.email,
    id: user.id,
  })
  themeSet(user.theme)
  queryClient.setQueryData<IUser>(["user-detail"], () => {
    return user
  })
}
