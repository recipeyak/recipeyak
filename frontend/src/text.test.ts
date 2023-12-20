import { normalizeUnitsFracs, urlToDomain } from "@/text"

describe("text", () => {
  test("capitalizeUnits", () => {
    const input = "tablespoon tablespoons Teaspoon Teaspoons"
    expect(normalizeUnitsFracs(input)).toEqual(
      "Tablespoon Tablespoons teaspoon teaspoons",
    )
  })
  test("normalize fractions", () => {
    expect(normalizeUnitsFracs("1 ½ teaspoon + ¼ tablespoon")).toEqual(
      "1 1/2 teaspoon + 1/4 Tablespoon",
    )
  })
})

test.each([
  [
    "https://cooking.nytimes.com/recipes/112390-some-example",
    "cooking.nytimes.com",
  ],

  ["https://food52.com/recipes/35930-momofuku-s-soy-sauce-eggs", "food52.com"],
  [
    "cooking.nytimes.com/recipes/1017327-roasted-chicken-provencal",
    "cooking.nytimes.com",
  ],
  ["fooo.bar", "fooo.bar"],
])("urlToDomain(%s) -> %s", (input: string, expected: string) => {
  expect(urlToDomain(input)).toEqual(expected)
})
