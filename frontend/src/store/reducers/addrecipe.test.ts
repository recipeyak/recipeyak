import addrecipe, { initialState, IAddRecipeState } from "./addrecipe"
import * as a from "./addrecipe"

import { IIngredientBasic } from "../../components/AddRecipe"
import { baseIngredient, baseStep } from "./recipes.test"

describe("addrecipe", () => {
  it("sets addrecipe form name", () => {
    const beforeState = {
      ...initialState,
      name: ""
    }

    const name = "example name"

    const afterState: IAddRecipeState = {
      ...initialState,
      name
    }

    expect(addrecipe(beforeState, a.setAddRecipeFormName(name))).toEqual(
      afterState
    )
  })

  it("set add recipe form author", () => {
    const beforeState = {
      ...initialState,
      author: ""
    }

    const author = "author"

    const afterState: IAddRecipeState = {
      ...initialState,
      author
    }

    expect(addrecipe(beforeState, a.setAddRecipeFormAuthor(author))).toEqual(
      afterState
    )
  })

  it("set add recipe form time", () => {
    const beforeState = {
      ...initialState,
      time: ""
    }

    const time = "time"

    const afterState: IAddRecipeState = {
      ...initialState,
      time
    }

    expect(addrecipe(beforeState, a.setAddRecipeFormTime(time))).toEqual(
      afterState
    )
  })

  it("set add recipe form source", () => {
    const beforeState = {
      ...initialState,
      source: ""
    }

    const source = "source"

    const afterState: IAddRecipeState = {
      ...initialState,
      source
    }

    expect(addrecipe(beforeState, a.setAddRecipeFormSource(source))).toEqual(
      afterState
    )
  })

  it("set add recipe form servings", () => {
    const beforeState = {
      ...initialState,
      servings: ""
    }

    const servings = "servings"

    const afterState: IAddRecipeState = {
      ...initialState,
      servings
    }

    expect(
      addrecipe(beforeState, a.setAddRecipeFormServings(servings))
    ).toEqual(afterState)
  })

  it("add add recipe form ingredient", () => {
    const beforeState = {
      ...initialState,
      ingredients: []
    }

    const ingredient = {
      ...baseIngredient,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const afterState: IAddRecipeState = {
      ...initialState,
      ingredients: [ingredient]
    }

    expect(
      addrecipe(beforeState, a.addAddRecipeFormIngredient(ingredient))
    ).toEqual(afterState)
  })

  it("remove add recipe form ingredient", () => {
    const ingredient = {
      ...baseIngredient,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const beforeState = {
      ...initialState,
      ingredients: [ingredient]
    }

    const afterState: IAddRecipeState = {
      ...initialState,
      ingredients: []
    }

    const index = 0

    expect(
      addrecipe(beforeState, a.removeAddRecipeFormIngredient(index))
    ).toEqual(afterState)
  })

  it("update add recipe form ingredient", () => {
    const ingredient = {
      ...baseIngredient,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const beforeState = {
      ...initialState,
      ingredients: [ingredient]
    }

    const newIngredient: IIngredientBasic = {
      quantity: "12 lbs",
      name: "tomato",
      description: "sliced",
      optional: false
    }

    const afterState: IAddRecipeState = {
      ...initialState,
      ingredients: [newIngredient]
    }

    const index = 0

    expect(
      addrecipe(
        beforeState,
        a.updateAddRecipeFormIngredient(index, newIngredient)
      )
    ).toEqual(afterState)
  })

  it("add add recipe form step", () => {
    const beforeState = {
      ...initialState,
      steps: []
    }

    const step = {
      text: "cook the food"
    }

    const afterState = {
      ...initialState,
      steps: [step]
    }

    expect(addrecipe(beforeState, a.addAddRecipeFormStep(step))).toEqual(
      afterState
    )
  })

  it("remove add recipe form step", () => {
    const step = {
      ...baseStep,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const beforeState = {
      ...initialState,
      steps: [step]
    }

    const afterState = {
      ...initialState,
      steps: []
    }

    const index = 0

    expect(addrecipe(beforeState, a.removeAddRecipeFormStep(index))).toEqual(
      afterState
    )
  })

  it("update add recipe form step", () => {
    const step = {
      ...baseStep,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const beforeState = {
      ...initialState,
      steps: [step]
    }

    const newStep = {
      ...baseStep,
      quantity: "12 lbs",
      name: "tomato",
      description: "sliced"
    }

    const afterState = {
      ...initialState,
      steps: [newStep]
    }

    const index = 0

    expect(
      addrecipe(beforeState, a.updateAddRecipeFormStep(index, newStep))
    ).toEqual(afterState)
  })

  it("clears add recipe form", () => {
    const step = {
      ...baseStep,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const beforeState = {
      ...initialState,
      steps: [step],
      name: "tesitng"
    }

    const afterState = initialState

    expect(addrecipe(beforeState, a.clearAddRecipeForm())).toEqual(afterState)
  })
})
