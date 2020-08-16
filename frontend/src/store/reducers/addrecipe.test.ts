import addrecipe, {
  initialState,
  IAddRecipeState,
  setAddRecipeFormName,
  setAddRecipeFormAuthor,
  setAddRecipeFormTime,
  setAddRecipeFormSource,
  setAddRecipeFormServings,
  addAddRecipeFormIngredient,
  removeAddRecipeFormIngredient,
  updateAddRecipeFormIngredient,
  addAddRecipeFormStep,
  removeAddRecipeFormStep,
  updateAddRecipeFormStep,
  clearAddRecipeForm,
} from "@/store/reducers/addrecipe"
import { baseIngredient, baseStep } from "@/store/reducers/recipes.test"
import { IIngredientBasic } from "@/store/reducers/recipes"

describe("addrecipe", () => {
  it("sets addrecipe form name", () => {
    const beforeState = {
      ...initialState,
      name: "",
    }

    const name = "example name"

    const afterState: IAddRecipeState = {
      ...initialState,
      name,
    }

    expect(addrecipe(beforeState, setAddRecipeFormName(name))).toEqual(
      afterState,
    )
  })

  it("set add recipe form author", () => {
    const beforeState = {
      ...initialState,
      author: "",
    }

    const author = "author"

    const afterState: IAddRecipeState = {
      ...initialState,
      author,
    }

    expect(addrecipe(beforeState, setAddRecipeFormAuthor(author))).toEqual(
      afterState,
    )
  })

  it("set add recipe form time", () => {
    const beforeState = {
      ...initialState,
      time: "",
    }

    const time = "time"

    const afterState: IAddRecipeState = {
      ...initialState,
      time,
    }

    expect(addrecipe(beforeState, setAddRecipeFormTime(time))).toEqual(
      afterState,
    )
  })

  it("set add recipe form source", () => {
    const beforeState = {
      ...initialState,
      source: "",
    }

    const source = "source"

    const afterState: IAddRecipeState = {
      ...initialState,
      source,
    }

    expect(addrecipe(beforeState, setAddRecipeFormSource(source))).toEqual(
      afterState,
    )
  })

  it("set add recipe form servings", () => {
    const beforeState = {
      ...initialState,
      servings: "",
    }

    const servings = "servings"

    const afterState: IAddRecipeState = {
      ...initialState,
      servings,
    }

    expect(addrecipe(beforeState, setAddRecipeFormServings(servings))).toEqual(
      afterState,
    )
  })

  it("add add recipe form ingredient", () => {
    const beforeState = {
      ...initialState,
      ingredients: [],
    }

    const ingredient = {
      ...baseIngredient,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced",
    }

    const afterState: IAddRecipeState = {
      ...initialState,
      ingredients: [ingredient],
    }

    expect(
      addrecipe(beforeState, addAddRecipeFormIngredient(ingredient)),
    ).toEqual(afterState)
  })

  it("remove add recipe form ingredient", () => {
    const ingredient = {
      ...baseIngredient,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced",
    }

    const beforeState = {
      ...initialState,
      ingredients: [ingredient],
    }

    const afterState: IAddRecipeState = {
      ...initialState,
      ingredients: [],
    }

    const index = 0

    expect(
      addrecipe(beforeState, removeAddRecipeFormIngredient(index)),
    ).toEqual(afterState)
  })

  it("update add recipe form ingredient", () => {
    const ingredient = {
      ...baseIngredient,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced",
    }

    const beforeState = {
      ...initialState,
      ingredients: [ingredient],
    }

    const newIngredient: IIngredientBasic = {
      quantity: "12 lbs",
      name: "tomato",
      description: "sliced",
      optional: false,
    }

    const afterState: IAddRecipeState = {
      ...initialState,
      ingredients: [newIngredient],
    }

    const index = 0

    expect(
      addrecipe(
        beforeState,
        updateAddRecipeFormIngredient({ index, ingredient: newIngredient }),
      ),
    ).toEqual(afterState)
  })

  it("add add recipe form step", () => {
    const beforeState = {
      ...initialState,
      steps: [],
    }

    const step = {
      text: "cook the food",
    }

    const afterState = {
      ...initialState,
      steps: [step],
    }

    expect(addrecipe(beforeState, addAddRecipeFormStep(step))).toEqual(
      afterState,
    )
  })

  it("remove add recipe form step", () => {
    const step = {
      ...baseStep,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced",
    }

    const beforeState = {
      ...initialState,
      steps: [step],
    }

    const afterState = {
      ...initialState,
      steps: [],
    }

    const index = 0

    expect(addrecipe(beforeState, removeAddRecipeFormStep(index))).toEqual(
      afterState,
    )
  })

  it("update add recipe form step", () => {
    const step = {
      ...baseStep,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced",
    }

    const beforeState = {
      ...initialState,
      steps: [step],
    }

    const newStep = {
      ...baseStep,
      quantity: "12 lbs",
      name: "tomato",
      description: "sliced",
    }

    const afterState = {
      ...initialState,
      steps: [newStep],
    }

    const index = 0

    expect(
      addrecipe(beforeState, updateAddRecipeFormStep({ index, step: newStep })),
    ).toEqual(afterState)
  })

  it("clears add recipe form", () => {
    const step = {
      ...baseStep,
      quantity: "1 lbs",
      name: "tomato",
      description: "sliced",
    }

    const beforeState = {
      ...initialState,
      steps: [step],
      name: "tesitng",
    }

    const afterState = initialState

    expect(addrecipe(beforeState, clearAddRecipeForm())).toEqual(afterState)
  })
})
