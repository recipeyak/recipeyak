import { Theme, useUserFetch } from "@/queries/userFetch"
import { themeGet } from "@/theme"

export function useUserTheme(): Theme {
  // caching to avoid some theme flashing -- still not perfect since the
  // index.html isn't preloaded with user data
  const user = useUserFetch()

  if (user.data?.theme == null) {
    return themeGet()
  }
  return user.data.theme
}
