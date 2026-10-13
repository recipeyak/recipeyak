import * as Sentry from "@sentry/react"
import { QueryClient } from "@tanstack/react-query"

import { client as ablyClient } from "@/components/ably"
import { cacheUpsertUser } from "@/queries/useUserFetch"
import { removeItem, setItem } from "@/storage"
import { themeSet } from "@/theme"
import { Theme, ThemeMode } from "@/themeConstants"
import { useLocalStorage } from "@/useLocalStorage"

const LOGGED_IN_CACHE_KEY = "loggedIn"

export function useIsLoggedIn(): boolean {
  const value = useLocalStorage(LOGGED_IN_CACHE_KEY)
  return value != null
}

export function logout(queryClient: QueryClient) {
  queryClient.clear()
  Sentry.setUser(null)
  themeSet({ day: "light", night: "dark", mode: "single" })
  removeItem(LOGGED_IN_CACHE_KEY)
}

type User = {
  readonly id: number
  readonly name: string
  readonly avatar_url: string
  readonly email: string
  readonly theme_day: Theme
  readonly theme_night: Theme
  readonly theme_mode: ThemeMode
  readonly schedule_team: number | null
  readonly calendar_id: number | null
}

// Ably tokens are scoped to the user's teams, so call this whenever the
// session user or their team memberships change.
export async function authorizeAbly() {
  try {
    await ablyClient.auth.authorize()
  } catch {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize ably")
  }
}

export async function login(user: User, queryClient: QueryClient) {
  await authorizeAbly()
  setUser(user, queryClient)
}

export function setUser(user: User, queryClient: QueryClient) {
  Sentry.setUser({
    email: user.email,
    id: user.id,
  })
  themeSet({
    day: user.theme_day,
    night: user.theme_night,
    mode: user.theme_mode,
  })
  cacheUpsertUser(queryClient, {
    updater: () => {
      return user
    },
  })
  setItem(LOGGED_IN_CACHE_KEY, "1")
}
