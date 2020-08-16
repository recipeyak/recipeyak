import React from "react"
import renderer from "react-test-renderer"
import { CalendarItem } from "@/components/CalendarDayItem"
import { isPast } from "date-fns"
import { TestProvider } from "@/testUtils"

describe("<CalendarDayItem> Snap", () => {
  test("smoke test render with styled components", () => {
    const scheduledRecipe = {
      id: 25,
      recipe: {
        id: 10,
        name: "Baked Ziti",
      },
    }

    const pastDate = new Date(1776, 1, 1)
    expect(isPast(pastDate)).toBe(true)

    const tree = renderer
      .create(
        <TestProvider>
          <CalendarItem
            count={1}
            id={scheduledRecipe.id}
            recipeID={scheduledRecipe.recipe.id}
            recipeName={scheduledRecipe.recipe.name}
            remove={jest.fn()}
            updateCount={jest.fn()}
            refetchShoppingList={jest.fn()}
            date={pastDate}
          />
        </TestProvider>,
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
