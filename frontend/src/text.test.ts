import { normalizeUnitsFracs } from "@/text"

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
