import * as Sentry from "@sentry/react"
import { QueryClient } from "@tanstack/react-query"

import { IUser } from "@/queries/userFetch"
import { removeItem, setItem } from "@/storage"
import { themeSet } from "@/theme"
import { useLocalStorage } from "@/useLocalStorage"

const LOGGED_IN_CACHE_KEY = "loggedIn"

export function useIsLoggedIn(): boolean {
  const value = useLocalStorage(LOGGED_IN_CACHE_KEY)
  return value != null
}

export function logout(queryClient: QueryClient) {
  queryClient.clear()
  Sentry.setUser(null)
  themeSet("light")
  removeItem(LOGGED_IN_CACHE_KEY)
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
  setItem(LOGGED_IN_CACHE_KEY, "1")
}
