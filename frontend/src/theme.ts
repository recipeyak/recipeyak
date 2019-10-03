import * as styledComponents from "styled-components"

export interface ITheme {
  readonly primaryColor: string
  readonly textSmall: string
}

export const theme: ITheme = {
  primaryColor: "#ff7247",
  textSmall: "0.875rem"
}

const {
  default: styled,
  css,
  keyframes,
  ThemeProvider
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ITheme>

export { styled, css, keyframes, ThemeProvider }
