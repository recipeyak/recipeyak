import addrecipe, { initialState, IAddRecipeState } from "./addrecipe"

import {
  setAddRecipeFormName,
  setAddRecipeFormAuthor,
  setAddRecipeFormSource,
  setAddRecipeFormTime,
  setAddRecipeFormServings,
  setAddRecipeFormTeam,
  addAddRecipeFormIngredient,
  removeAddRecipeFormIngredient,
  updateAddRecipeFormIngredient,
  addAddRecipeFormStep,
  removeAddRecipeFormStep,
  updateAddRecipeFormStep,
  clearAddRecipeForm
} from "../actions"

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

    expect(addrecipe(beforeState, setAddRecipeFormName(name))).toEqual(
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

    expect(addrecipe(beforeState, setAddRecipeFormAuthor(author))).toEqual(
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

    expect(addrecipe(beforeState, setAddRecipeFormTime(time))).toEqual(
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

    expect(addrecipe(beforeState, setAddRecipeFormSource(source))).toEqual(
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

    expect(addrecipe(beforeState, setAddRecipeFormServings(servings))).toEqual(
      afterState
    )
  })

  it("add add recipe form ingredient", () => {
    const beforeState = {
      ...initialState,
      ingredients: []
    }

    const ingredient = {
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const afterState: IAddRecipeState = {
      ...initialState,
      ingredients: [ingredient]
    }

    expect(
      addrecipe(beforeState, addAddRecipeFormIngredient(ingredient))
    ).toEqual(afterState)
  })

  it("remove add recipe form ingredient", () => {
    const ingredient = {
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
      addrecipe(beforeState, removeAddRecipeFormIngredient(index))
    ).toEqual(afterState)
  })

  it("update add recipe form ingredient", () => {
    const ingredient = {
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const beforeState = {
      ...initialState,
      ingredients: [ingredient]
    }

    const newIngredient = {
      quantity: "12 lbs",
      name: "tomato",
      description: "sliced"
    }

    const afterState: IAddRecipeState = {
      ...initialState,
      ingredients: [newIngredient]
    }

    const index = 0

    expect(
      addrecipe(
        beforeState,
        updateAddRecipeFormIngredient(index, newIngredient)
      )
    ).toEqual(afterState)
  })

  it("add add recipe form step", () => {
    const beforeState = {
      ...initialState,
      steps: []
    }

    const step = {
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const afterState = {
      ...initialState,
      steps: [step]
    }

    expect(addrecipe(beforeState, addAddRecipeFormStep(step))).toEqual(
      afterState
    )
  })

  it("remove add recipe form step", () => {
    const step = {
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

    expect(addrecipe(beforeState, removeAddRecipeFormStep(index))).toEqual(
      afterState
    )
  })

  it("update add recipe form step", () => {
    const step = {
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced"
    }

    const beforeState = {
      ...initialState,
      steps: [step]
    }

    const newStep = {
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
      addrecipe(beforeState, updateAddRecipeFormStep(index, newStep))
    ).toEqual(afterState)
  })

  it("clears add recipe form", () => {
    const step = {
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

    expect(addrecipe(beforeState, clearAddRecipeForm())).toEqual(afterState)
  })

  it("sets add recipe form's team field", () => {
    const beforeState = initialState

    const team = "cool team name"

    const afterState: IAddRecipeState = {
      ...initialState,
      team
    }

    expect(addrecipe(beforeState, setAddRecipeFormTeam(team))).toEqual(
      afterState
    )
  })
})
