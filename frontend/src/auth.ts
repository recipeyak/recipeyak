import * as Sentry from "@sentry/react"
import { QueryClient } from "@tanstack/react-query"

import { IUser } from "@/queries/userFetch"
import { themeSet } from "@/theme"

export function logout(queryClient: QueryClient) {
  queryClient.clear()
  Sentry.setUser(null)
  themeSet("light")
  localStorage.removeItem("loggedIn")
}

export function login(user: IUser, queryClient: QueryClient) {
  Sentry.setUser({
    email: user.email,
    id: user.id,
  })
  themeSet(user.theme)
  queryClient.setQueryData<IUser>(["user-detail"], () => {
    return user
  })
  localStorage.setItem("loggedIn", "1")
}
