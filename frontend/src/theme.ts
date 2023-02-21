import { transparentize } from "polished"
// eslint-disable-next-line no-restricted-imports
import * as styledComponents from "styled-components"

export function themeGet(): "light" | "autumn" {
  const val = localStorage.getItem("recipeyak-theme-v1")
  switch (val) {
    case "autumn":
      return "autumn"
    case "light":
    default:
      return "light"
  }
}

export function themeSet(theme: "light" | "autumn") {
  const themeToClassName = {
    light: "",
    autumn: "theme-autumn",
  } as const
  localStorage.setItem("recipeyak-theme-v1", theme)
  const html = document.documentElement
  // clear out all the existing themes
  html.classList.forEach((class_) => {
    if (class_.startsWith("theme")) {
      html.classList.remove(class_)
    }
  })
  const newClass = themeToClassName[theme]
  if (!newClass) {
    return
  }
  html.classList.add(newClass)
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

const primary = "#ff7247"
const muted = "#7a7a7a"

export const theme: ITheme = {
  color: {
    white: "#f9f9f9",
    background: "white",
    primary,
    muted,
    primaryShadow: transparentize(0.2, primary),
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
