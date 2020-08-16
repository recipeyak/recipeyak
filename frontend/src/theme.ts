// eslint-disable-next-line no-restricted-imports
import * as styledComponents from "styled-components"
import { transparentize } from "polished"

export interface ITheme {
  readonly color: {
    readonly white: string
    readonly primary: string
    readonly primaryShadow: string
  }
  readonly text: {
    readonly small: string
  }
  readonly medium: string
  readonly small: string
}

const primary = "#ff7247"

export const theme: ITheme = {
  color: {
    white: "#f9f9f9",
    primary,
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
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ITheme>

export { styled, css, keyframes, ThemeProvider }
