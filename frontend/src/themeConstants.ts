export type Theme = keyof typeof THEME_META
export type ThemeMode = "single" | "sync_with_system"

export const THEME_META = {
  light: {
    displayName: "Light",
    cssClass: "theme-light",
  },
  dark: {
    displayName: "Dark",
    cssClass: "theme-dark",
  },
  dark_dimmed: {
    displayName: "Dark Dimmed",
    cssClass: "theme-dark-dimmed",
  },
  autumn: {
    displayName: "Autumn",
    cssClass: "theme-autumn",
  },
  solarized: {
    displayName: "Solarized",
    cssClass: "theme-solarized",
  },
} satisfies Record<string, { displayName: string; cssClass: string }>

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const THEME_IDS = Object.keys(THEME_META) as Theme[]
