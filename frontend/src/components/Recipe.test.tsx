import React from "react"
import { match as Match } from "react-router"
import { Location } from "history"
import renderer, { act } from "react-test-renderer"
import { mount } from "enzyme"
import { emptyStore as store, history } from "@/store/store"
import { Recipe } from "@/components/Recipe"
import { IRecipe, fetchRecipe } from "@/store/reducers/recipes"
import {
  baseRecipe,
  baseIngredient,
  baseStep
} from "@/store/reducers/recipes.test"
import { TestProvider } from "@/testUtils"
import { RecipeTimeline } from "@/components/RecipeTimeline"

describe("<Recipe/>", () => {
  const match: Match<{ id: string }> = {
    path: "/recipes/:id(\\d+)(.*)",
    url: "/recipes/98-apple-crisp",
    isExact: true,
    params: {
      id: "98"
    }
  }
  const location: Location = {
    pathname: "/recipes/98-apple-crisp",
    search: "?timeline=1",
    hash: "",
    key: "u3gfv7",
    state: null
  }

  it("renders without failure", () => {
    mount(
      <TestProvider>
        <Recipe history={history} match={match} location={location} />
      </TestProvider>
    )
  })

  describe("snaps", () => {
    test("recipe", () => {
      const recipe: IRecipe = {
        ...baseRecipe,
        id: 98,
        name: "Apple Crisp",
        ingredients: [baseIngredient],
        steps: [baseStep]
      }

      const actions = [
        fetchRecipe.failure({ id: recipe.id, error404: true }),
        fetchRecipe.success(recipe)
      ]

      actions.forEach(action => {
        act(() => {
          store.dispatch(action)
        })

        const tree = renderer
          .create(
            <TestProvider>
              <Recipe
                history={history}
                match={match}
                location={{ ...location, search: "?timeline=1" }}
              />
            </TestProvider>
          )
          .toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
    test("timeline", () => {
      const timelineTree = renderer
        .create(
          <TestProvider>
            <RecipeTimeline createdAt="1776-1-1" recipeId={10} />
          </TestProvider>
        )
        .toJSON()
      expect(timelineTree).toMatchSnapshot()
    })
  })
})
