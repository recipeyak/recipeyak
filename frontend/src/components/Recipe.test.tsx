import React, { ReactElement } from "react"
import { match as Match } from "react-router"
import { Location } from "history"
import renderer, { act } from "react-test-renderer"
import { mount } from "enzyme"
import { history, Store, createEmptyStore } from "@/store/store"
import { Recipe, useRecipe } from "@/components/Recipe"
import {
  IRecipe,
  fetchRecipe,
  IRecipesState,
  initialState
} from "@/store/reducers/recipes"
import {
  baseRecipe,
  baseIngredient,
  baseStep
} from "@/store/reducers/recipes.test"
import { TestProvider } from "@/testUtils"
import { RecipeTimeline } from "@/components/RecipeTimeline"
import { Success } from "@/webdata"

// based on https://dev.to/itsjoekent/write-functional-tests-for-react-hooks-4b07
// with the added benefit of being typed
function testHook<T>(func: () => T, store: Store): T {
  interface ISpanProps<P> {
    readonly output: P
  }
  function Span<S>(_props: ISpanProps<S>) {
    return <></>
  }
  function TestComponent() {
    const state = func()
    return <Span output={state} />
  }
  const root = mount(
    <TestProvider store={store}>
      <TestComponent />
    </TestProvider>
  )

  return root.find<ISpanProps<T>>(Span).props().output
}

function rendererCreate<T>(x: ReactElement<T>) {
  return renderer.create(x, {
    createNodeMock: () => document.createElement("textarea")
  })
}

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
      const store = createEmptyStore()

      const actions = [
        fetchRecipe.failure({ id: recipe.id, error404: true }),
        fetchRecipe.success(recipe)
      ]

      actions.forEach(action => {
        act(() => {
          store.dispatch(action)
        })

        const tree = rendererCreate(
          <TestProvider store={store}>
            <Recipe
              history={history}
              match={match}
              location={{ ...location, search: "?timeline=1" }}
            />
          </TestProvider>
        ).toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    test("recipe all states", () => {
      const store = createEmptyStore()
      const recipe: IRecipe = {
        ...baseRecipe,
        id: 98,
        name: "Apple Crisp",
        ingredients: [baseIngredient],
        steps: [baseStep]
      }

      store.dispatch(fetchRecipe.success(recipe))

      const root = rendererCreate(
        <TestProvider store={store}>
          <Recipe
            history={history}
            match={match}
            location={{ ...location, search: "?timeline=1" }}
          />
        </TestProvider>
      )
      expect(root.toJSON()).toMatchSnapshot()

      root.update(
        <TestProvider store={store}>
          <Recipe
            history={history}
            match={match}
            location={{ ...location, search: "" }}
          />
        </TestProvider>
      )
      expect(root.toJSON()).toMatchSnapshot()
    })

    test("useRecipe hook", () => {
      const recipe: IRecipe = {
        ...baseRecipe,
        id: 98,
        name: "Apple Crisp",
        ingredients: [baseIngredient],
        steps: [baseStep]
      }

      const recipes: IRecipesState = {
        ...initialState,
        byId: {
          98: Success(recipe)
        }
      }
      const emptyState = createEmptyStore().getState()
      const store = createEmptyStore({
        ...emptyState,
        recipes
      })

      const res = testHook(() => useRecipe(recipe.id), store)
      expect(res).toMatchSnapshot("Refetching")
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
