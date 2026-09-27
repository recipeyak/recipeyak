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

export async function login(
  user: {
    readonly id: number
    readonly name: string
    readonly avatar_url: string
    readonly email: string
    readonly theme_day: Theme
    readonly theme_night: Theme
    readonly theme_mode: ThemeMode
    readonly schedule_team: number | null
    readonly calendar_id: number | null
  },
  queryClient: QueryClient,
  { refreshRealtimeAuth = true }: { refreshRealtimeAuth?: boolean } = {},
) {
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
  // The realtime client authenticates itself when it connects, so we only need
  // to force a new token when the connection isn't healthy, e.g., after going
  // from logged out to logged in.
  const connectionState = ablyClient.connection.state
  const needsAuth =
    refreshRealtimeAuth ||
    (connectionState !== "connected" && connectionState !== "connecting")
  try {
    if (needsAuth) {
      await ablyClient.auth.authorize()
    }
  } catch {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize ably")
  }
  setItem(LOGGED_IN_CACHE_KEY, "1")
}
