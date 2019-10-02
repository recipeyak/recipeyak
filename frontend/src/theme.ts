import * as styledComponents from "styled-components"

export interface IThemeInterface {
  readonly primaryColor: string
}

// TODO(sbdchd): upgrade typescript and use `as const` and `typeof`

export const theme: IThemeInterface = {
  primaryColor: "#ff7247"
}

const {
  default: styled,
  css,
  keyframes,
  ThemeProvider
} = styledComponents as styledComponents.ThemedStyledComponentsModule<
  IThemeInterface
>

export { styled, css, keyframes, ThemeProvider }
