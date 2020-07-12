import React from "react"
import renderer from "react-test-renderer"
import { TestProvider } from "@/testUtils"
import IngredientView from "@/components/IngredientView"

describe("<IngredientView/>", () => {
  test("snap with capitalization", () => {
    const testCases = [
      "3 tablespoons",
      "1 teaspoon",
      "1 tablespoon + 2 teaspoons",
      "1 Teaspoon"
    ]

    testCases.forEach(quantity => {
      const tree = renderer
        .create(
          <TestProvider>
            <IngredientView
              dragRef={undefined}
              quantity={quantity}
              name="salt"
              optional={false}
              description=""
            />
          </TestProvider>
        )
        .toJSON()

      expect(tree).toMatchSnapshot()
    })
  })
})
