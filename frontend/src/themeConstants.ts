export type Theme = keyof typeof THEME_META
export type ThemeMode = "single" | "sync_with_system"

export const THEME_CSS_BAKING_SODA = "font-medium text-red-500"
export const THEME_CSS_BAKING_POWDER = "font-medium text-blue-400"

export const THEME_META = {
  light: {
    displayName: "Light",
    cssClass: "theme-light",
    bgFill: "#FFFFFF",
    fgFill: "#4A4A4A",
  },
  dark: {
    displayName: "Dark",
    cssClass: "theme-dark",
    bgFill: "#0D1116",
    fgFill: "#E6EDF3",
  },
  dark_dimmed: {
    displayName: "Dark Dimmed",
    cssClass: "theme-dark-dimmed",
    fgFill: "#ACBAC7",
    bgFill: "rgb(28, 33, 40)",
  },
  autumn: {
    displayName: "Autumn",
    cssClass: "theme-autumn",
    fgFill: "#EDEDED",
    bgFill: "#B96E34",
  },
  solarized: {
    displayName: "Solarized",
    cssClass: "theme-solarized",
    fgFill: "#4A4A4A",
    bgFill: "#FDF6E3",
  },
} satisfies Record<
  string,
  { displayName: string; cssClass: string; bgFill: string; fgFill: string }
>

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const THEME_IDS = Object.keys(THEME_META) as Theme[]
