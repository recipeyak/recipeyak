import React from "react"
import renderer from "react-test-renderer"
import { CalendarItem } from "@/components/CalendarDayItem"
import HTML5Backend from "react-dnd-html5-backend"
import { DndProvider } from "react-dnd"
import { MemoryRouter } from "react-router"
import { ThemeProvider, theme } from "@/theme"

describe("<CalendarDayItem> Snap", () => {
  test("smoke test render with styled components", () => {
    const date = new Date(1776, 1, 1)
    const scheduledRecipe = {
      id: 25,
      recipe: {
        id: 10,
        name: "Baked Ziti"
      }
    }
    const tree = renderer
      .create(
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <DndProvider backend={HTML5Backend}>
              <CalendarItem
                count={1}
                id={scheduledRecipe.id}
                recipeID={scheduledRecipe.recipe.id}
                recipeName={scheduledRecipe.recipe.name}
                remove={jest.fn()}
                updateCount={jest.fn()}
                refetchShoppingList={jest.fn()}
                date={date}
              />
            </DndProvider>
          </MemoryRouter>
        </ThemeProvider>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
