// eslint-disable-next-line no-restricted-imports
import * as styledComponents from "styled-components"

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
    if (!args.night) {
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
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-restricted-globals
  const storedValue = localStorage.getItem(
    THEME_CACHE_KEY,
  ) as ThemeSerialized | null
  return storedValue ?? { day: "light", night: "dark", mode: "single" }
}

export interface ITheme {
  readonly color: {
    readonly white: string
    readonly background: string
    readonly primary: string
    readonly muted: string
    readonly primaryShadow: string
  }
  readonly text: {
    readonly small: string
  }
  readonly medium: string
  readonly small: string
}

const primary = "var(--color-primary)"
const muted = "var(--color-text-muted)"

export const theme: ITheme = {
  color: {
    white: "#f9f9f9",
    background: "white",
    primary,
    muted,
    primaryShadow: "var(--color-primary-shadow)",
  },
  text: {
    small: "0.875rem",
  },
  medium: "992px",
  small: "630px",
}

const {
  default: styled,
  css,
  keyframes,
  ThemeProvider,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
} = styledComponents as unknown as styledComponents.ThemedStyledComponentsModule<ITheme>

export { css, keyframes, styled, ThemeProvider }
