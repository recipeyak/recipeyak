import { capitalizeUnits } from "@/text"

describe("text", () => {
  test("capitalizeUnits", () => {
    const input = "tablespoon tablespoons Teaspoon Teaspoons"
    expect(capitalizeUnits(input)).toEqual(
      "Tablespoon Tablespoons teaspoon teaspoons"
    )
  })
})
