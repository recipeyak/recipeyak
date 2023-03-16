const NORMALIZE_MAPPING = {
  "½": "1/2",
  "⅓": "1/3",
  "⅔": "2/3",
  "¼": "1/4",
  "¾": "3/4",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅐": "1/7",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
  "⅑": "1/9",
  "⅒": "1/10",
  tablespoon: "Tablespoon",
  Teaspoon: "teaspoon",
  tbsp: "Tbsp",
  tsp: "tsp",
}

/**
 * Mixing up Tablespoon and teaspoon is harder when they are consistently cased.
 * Also normalize unicode fractions.
 */
export function normalizeUnitsFracs(str: string): string {
  return Object.entries(NORMALIZE_MAPPING).reduce(
    (acc, [pattern, replaceVal]) =>
      acc.replace(new RegExp(pattern, "g"), replaceVal),
    str,
  )
}
