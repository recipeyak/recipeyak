// eslint-disable-next-line no-restricted-imports
import * as styledComponents from "styled-components"

export interface ITheme {
  readonly color: {
    readonly white: string
    readonly primary: string
  }
  readonly text: {
    readonly small: string
  }
}

export const theme: ITheme = {
  color: {
    white: "#f9f9f9",
    primary: "#ff7247"
  },
  text: {
    small: "0.875rem"
  }
}

const {
  default: styled,
  css,
  keyframes,
  ThemeProvider
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ITheme>

export { styled, css, keyframes, ThemeProvider }
