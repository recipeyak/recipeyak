// eslint-disable-next-line no-restricted-imports
import * as styledComponents from "styled-components"

import { setItem } from "@/storage"
import { Theme, THEME_META } from "@/themeConstants"

const THEME_CACHE_KEY = "recipeyak-theme-v2"

export function themeSet(theme: Theme) {
  setItem(THEME_CACHE_KEY, theme)
  const html = document.documentElement
  // clear out all the existing themes
  html.classList.forEach((class_) => {
    if (class_.startsWith("theme")) {
      html.classList.remove(class_)
    }
  })
  const newClass = THEME_META[theme].cssClass
  if (!newClass) {
    return
  }
  html.classList.add(newClass)
}

export function themeGet(): Theme {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-restricted-globals
  const storedValue = localStorage.getItem(THEME_CACHE_KEY) as Theme | null
  return storedValue ?? "light"
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
