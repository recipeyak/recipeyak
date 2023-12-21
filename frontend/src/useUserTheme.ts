import { useUserFetch } from "@/queries/userFetch"
import { themeGet, ThemeSerialized } from "@/theme"

export function useUserTheme(): ThemeSerialized {
  // caching to avoid some theme flashing -- still not perfect since the
  // index.html isn't preloaded with user data
  const user = useUserFetch()

  if (user.data == null) {
    return themeGet()
  }

  return {
    day: user.data.theme_day,
    night: user.data.theme_night,
    mode: user.data.theme_mode,
  }
}
