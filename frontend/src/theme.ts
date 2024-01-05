import { setItem } from "@/storage"
import { Theme, THEME_META, ThemeMode } from "@/themeConstants"

const THEME_CACHE_KEY = "recipeyak-theme-v4"

export type ThemeSerialized = { day: Theme; night: Theme; mode: ThemeMode }

export function themeSet(args: ThemeSerialized) {
  setItem(THEME_CACHE_KEY, JSON.stringify(args))
  const html = document.documentElement
  // clear out all the existing themes
  html.classList.forEach((class_) => {
    if (
      class_.startsWith("theme") ||
      class_.startsWith("day") ||
      class_.startsWith("night")
    ) {
      html.classList.remove(class_)
    }
  })

  if (args.mode === "single") {
    const newClassDay = THEME_META[args.day].cssClass
    if (!newClassDay) {
      return
    }
    html.classList.add(newClassDay)
  }
  if (args.mode === "sync_with_system") {
    const newClassDay = THEME_META[args.day].cssClass

    // --color-background
    if (!newClassDay) {
      return
    }
    const newClassNight = THEME_META[args.night].cssClass
    if (!newClassNight) {
      return
    }

    html.classList.add(`day:${newClassDay}`, `night:${newClassNight}`)
  }
}

export function themeGet(): ThemeSerialized {
  // eslint-disable-next-line no-restricted-globals
  const storedValueRaw = localStorage.getItem(THEME_CACHE_KEY)
  if (!storedValueRaw) {
    return { day: "light", night: "dark", mode: "single" }
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const storedValue = JSON.parse(storedValueRaw) as ThemeSerialized | null
  return {
    day: storedValue?.day || "light",
    night: storedValue?.night || "dark",
    mode: storedValue?.mode || "single",
  }
}
