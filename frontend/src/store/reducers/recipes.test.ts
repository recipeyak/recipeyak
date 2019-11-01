import recipes, {
  IRecipesState,
  IRecipe,
  IIngredient,
  IStep,
  getRecipeById,
  deleteRecipe,
  initialState,
  deleteStep,
  fetchRecipe,
  updateRecipe,
  updateRecipeOwner,
  fetchRecipeList,
  addStepToRecipe,
  addIngredientToRecipe,
  updateStep,
  updateIngredient,
  deleteIngredient,
  updatingRecipeAsync,
  setSchedulingRecipe,
  duplicateRecipe,
  duplicateRecipeAsync
} from "@/store/reducers/recipes"
import { IState } from "@/store/store"
import { HttpErrorKind, Loading, isSuccess, Failure, Success } from "@/webdata"
import { getModel } from "redux-loop"
import { deletingIngredientAsync } from "@/store/thunks"
import { assertCmdFuncEq, createHttpMocker } from "@/testUtils"
import { push } from "connected-react-router"
import { recipeURL } from "@/urls"

export const baseRecipe: IRecipe = {
  id: 1,
  name: "foo",
  author: "bar",
  source: "foo.com",
  time: "1776",
  servings: "12 servings",
  steps: [],
  edits: [],
  modified: "1778",
  last_scheduled: "1779",
  team: 1,
  owner: {
    id: 1,
    type: "user"
  },
  ingredients: [],
  created: "1776-1-1"
}

export const baseIngredient: IIngredient = {
  id: 1,
  name: "foo",
  quantity: "1 cup",
  description: "chopped",
  position: 12.3,
  optional: false
}

export const baseStep: IStep = {
  id: 1,
  text: "foo",
  position: 10
}

function recipeStoreWith(recipe: IRecipe | IRecipe[]): IRecipesState {
  if (Array.isArray(recipe)) {
    return getModel(
      recipes(
        undefined,
        fetchRecipeList.success({ recipes: recipe, teamID: "personal" })
      )
    )
  }
  return getModel(recipes(undefined, fetchRecipe.success(recipe)))
}

describe("Recipes", () => {
  it("Remove recipe from recipe list", () => {
    const res = [
      {
        ...baseRecipe,
        id: 123
      },
      {
        ...baseRecipe,
        id: 2
      }
    ]
    const [first, second] = res
    const beforeState = recipeStoreWith(res)
    const after = getModel(recipes(beforeState, deleteRecipe.success(first.id)))
    expect(after.personalIDs).toEqual(Success([second.id]))
    expect(after.byId[first.id]).toBeUndefined()

    const maybeSecond = getRecipeById(
      { recipes: beforeState } as IState,
      second.id
    )
    expect(maybeSecond).not.toBeUndefined()
    expect(maybeSecond).not.toBeNull()
    if (maybeSecond == null) {
      return
    }

    expect(isSuccess(maybeSecond)).toEqual(true)
    if (isSuccess(maybeSecond)) {
      expect(maybeSecond.data).toEqual(second)
    }
  })

  it("Remove non-existent recipe from recipe list", () => {
    expect(recipes(initialState, deleteRecipe.success(123))).toEqual(
      initialState
    )
  })

  it("sets deleting of the recipe", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      name: "good recipe",
      steps: [],
      deleting: false
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      name: "good recipe",
      steps: [],
      deleting: true
    })

    expect(getModel(recipes(beforeState, deleteRecipe.request(1)))).toEqual(
      afterState
    )
    expect(getModel(recipes(afterState, deleteRecipe.failure(1)))).toEqual(
      beforeState
    )
  })

  it("adds a step to the recipe", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      name: "good recipe",
      steps: []
    })

    const newStep = {
      ...baseStep,
      id: 1,
      text: "a new step",
      position: 10
    }

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      name: "good recipe",
      steps: [newStep],
      addingStepToRecipe: false,
      draftStep: ""
    })

    expect(
      getModel(
        recipes(beforeState, addStepToRecipe.success({ id: 1, step: newStep }))
      )
    ).toEqual(afterState)
  })

  it("adds an ingredient to the recipe and doesn't delete steps", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [],
      steps: [
        {
          id: 1,
          text: "test",
          position: 10
        }
      ]
    })

    const newIngredient = baseIngredient

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [newIngredient],
      steps: [
        {
          id: 1,
          text: "test",
          position: 10
        }
      ],
      addingIngredient: false
    })

    expect(
      getModel(
        recipes(
          beforeState,
          addIngredientToRecipe.success({ id: 1, ingredient: newIngredient })
        )
      )
    ).toEqual(afterState)

    const failureAfterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      steps: [
        {
          id: 1,
          text: "test",
          position: 10
        }
      ],
      addingIngredient: false
    })

    expect(recipes(beforeState, addIngredientToRecipe.failure(1))).toEqual(
      failureAfterState
    )
  })

  it("updates a step", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [baseIngredient],
      steps: [
        {
          id: 1,
          text: "test",
          position: 2.54
        }
      ]
    })

    const text = "new text"
    const position = 10.0

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [baseIngredient],
      steps: [
        {
          id: 1,
          text,
          position,
          updating: false
        }
      ]
    })

    expect(
      recipes(
        beforeState,
        updateStep.success({ recipeID: 1, stepID: 1, text, position })
      )
    ).toEqual(afterState)
  })

  it("it updates an ingredient", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [
        {
          ...baseIngredient,
          id: 1,
          quantity: "2 count",
          name: "Tomato",
          description: "sliced"
        }
      ],
      steps: [baseStep]
    })

    const newIngredient: IIngredient = {
      ...baseIngredient,
      id: 1,
      quantity: "4 count",
      name: "Tomato",
      description: "diced"
    }

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [
        {
          ...newIngredient,
          updating: false
        }
      ],
      steps: [baseStep]
    })

    expect(
      recipes(
        beforeState,
        updateIngredient.success({
          recipeID: 1,
          ingredientID: 1,
          content: newIngredient
        })
      )
    ).toEqual(afterState)

    const failureAfterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [
        {
          ...baseIngredient,
          id: 1,
          quantity: "2 count",
          name: "Tomato",
          description: "sliced",
          updating: false
        }
      ],
      steps: [baseStep]
    })

    expect(
      recipes(
        beforeState,
        updateIngredient.failure({
          recipeID: 1,
          ingredientID: 1
        })
      )
    ).toEqual(failureAfterState)
  })

  it("deletes an ingredient from a recipe", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      id: 1,
      ingredients: [
        {
          ...baseIngredient,
          id: 1
        },
        {
          ...baseIngredient,
          id: 2
        }
      ]
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      id: 1,
      ingredients: [
        {
          ...baseIngredient,
          id: 2
        }
      ]
    })
    expect(
      recipes(
        beforeState,
        deleteIngredient.success({ recipeID: 1, ingredientID: 1 })
      )
    ).toEqual(afterState)
  })

  it("deletes a step from a recipe", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      steps: [
        {
          ...baseStep,
          id: 1,
          text: "test"
        },
        {
          ...baseStep,
          id: 2,
          text: "target"
        }
      ]
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      steps: [
        {
          ...baseStep,
          id: 2,
          text: "target"
        }
      ]
    })

    expect(
      getModel(
        recipes(beforeState, deleteStep.success({ recipeID: 1, stepID: 1 }))
      )
    ).toEqual(afterState)
  })

  it("sets the loading state for adding a step to a recipe", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      addingStepToRecipe: false
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      addingStepToRecipe: true
    })

    expect(
      getModel(
        recipes(beforeState, addStepToRecipe.request({ id: 1, step: "foo" }))
      )
    ).toEqual(afterState)
  })

  it("sets the recipe to be adding an ingredient", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      addingIngredient: false
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      addingIngredient: true
    })

    expect(
      getModel(
        recipes(
          beforeState,
          addIngredientToRecipe.request({
            recipeID: 1,
            ingredient: { name: "foo" }
          })
        )
      )
    ).toEqual(afterState)
  })

  it("sets the recipe to be updating a specific ingredient", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [
        {
          ...baseIngredient,
          updating: false
        }
      ]
    })
    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [
        {
          ...baseIngredient,
          updating: true
        }
      ]
    })

    expect(
      getModel(
        recipes(
          beforeState,
          updateIngredient.request({
            recipeID: 1,
            ingredientID: 1,
            content: { name: "foo" }
          })
        )
      )
    ).toEqual(afterState)
  })

  it("sets the recipe to be removing a specific ingredient", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [
        {
          ...baseIngredient,
          removing: false
        }
      ]
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      ingredients: [
        {
          ...baseIngredient,
          removing: true
        }
      ]
    })

    const nextState = recipes(
      beforeState,
      deleteIngredient.request({ recipeID: 1, ingredientID: 1 })
    )

    expect(getModel(nextState)).toEqual(afterState)

    assertCmdFuncEq(nextState, deletingIngredientAsync)
  })

  it("sets the recipe to be updating a specific step", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      steps: [
        {
          ...baseStep,
          updating: false
        }
      ]
    })
    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      steps: [
        {
          ...baseStep,
          updating: true
        }
      ]
    })

    expect(
      getModel(
        recipes(beforeState, updateStep.request({ recipeID: 1, stepID: 1 }))
      )
    ).toEqual(afterState)
  })

  it("sets the recipe to be removing a specific step", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      steps: [
        {
          ...baseStep,
          id: 1,
          text: "a new step",
          removing: false
        }
      ]
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      steps: [
        {
          ...baseStep,
          id: 1,
          text: "a new step",
          removing: true
        }
      ]
    })
    expect(
      getModel(
        recipes(beforeState, deleteStep.request({ recipeID: 1, stepID: 1 }))
      )
    ).toEqual(afterState)
  })

  it("fetch recipe works", () => {
    const beforeState: IRecipesState = initialState
    const fetchingState = {
      loadingAll: false,
      errorLoadingAll: false,
      byId: {
        [baseRecipe.id]: Loading()
      },
      personalIDs: undefined
    }
    const fetchingActual = getModel(
      recipes(beforeState, fetchRecipe.request(baseRecipe.id))
    )
    expect(fetchingActual.byId).toEqual(fetchingState.byId)
    expect(fetchingActual.personalIDs).toEqual(fetchingState.personalIDs)

    const successState: IRecipesState = recipeStoreWith({
      ...baseRecipe
    })
    expect(recipes(beforeState, fetchRecipe.success(baseRecipe))).toEqual(
      successState
    )

    const failureState = {
      loadingAll: false,
      errorLoadingAll: false,
      byId: {
        [baseRecipe.id]: Failure(HttpErrorKind.error404)
      },
      personalIDs: undefined
    }

    const failActual = getModel(
      recipes(beforeState, fetchRecipe.failure({ id: 1, error404: true }))
    )
    expect(failActual.byId).toEqual(failureState.byId)
    expect(failActual.personalIDs).toEqual(failureState.personalIDs)
  })

  it("sets the recipe to updating", () => {
    const beforeState: IRecipesState = recipeStoreWith(baseRecipe)

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      updating: true
    })

    const actual = recipes(
      beforeState,
      updateRecipe.request({ id: 1, data: { name: "foo" } })
    )

    expect(getModel(actual)).toEqual(afterState)

    assertCmdFuncEq(actual, updatingRecipeAsync)

    const newRecipe: IRecipe = {
      ...baseRecipe,
      name: baseRecipe.name + "foo"
    }

    expect(newRecipe.name).not.toEqual(baseRecipe.name)

    expect(recipes(beforeState, updateRecipe.success(newRecipe))).toEqual(
      recipeStoreWith({ ...newRecipe, updating: false, editing: false })
    )
  })

  it("overwrites the recipe correctly", () => {
    const beforeState: IRecipesState = recipeStoreWith([
      {
        ...baseRecipe,
        name: "Initial recipe name",
        updating: true
      }
    ])

    const newRecipe = {
      ...baseRecipe,
      name: "new recipe name"
    }

    const afterState: IRecipesState = {
      ...recipeStoreWith({
        ...baseRecipe,
        name: "new recipe name"
      }),
      personalIDs: Success([baseRecipe.id])
    }

    expect(recipes(beforeState, fetchRecipe.success(newRecipe))).toEqual(
      afterState
    )
  })

  it("sets recipe owner for recipe move", () => {
    const beforeState: IRecipesState = recipeStoreWith([
      {
        ...baseRecipe,
        id: 1,
        name: "Initial recipe name 1"
      },
      {
        ...baseRecipe,
        id: 2,
        name: "Initial recipe name 2"
      }
    ])

    const afterState: IRecipesState = recipeStoreWith([
      {
        ...baseRecipe,
        id: 1,
        name: "Initial recipe name 1",
        owner: {
          id: 14,
          type: "team",
          name: "A Cool Name"
        }
      },
      {
        ...baseRecipe,
        id: 2,
        name: "Initial recipe name 2"
      }
    ])
    const id = 1
    const owner: IRecipe["owner"] = {
      id: 14,
      type: "team",
      name: "A Cool Name"
    }

    expect(recipes(beforeState, updateRecipeOwner({ id, owner }))).toEqual(
      afterState
    )
  })

  it("sets recipe scheduling", () => {
    const beforeState: IRecipesState = recipeStoreWith([
      {
        ...baseRecipe,
        id: 1,
        name: "Initial recipe name 1"
      },
      {
        ...baseRecipe,
        id: 2,
        name: "Initial recipe name 2"
      }
    ])

    const afterState: IRecipesState = recipeStoreWith([
      {
        ...baseRecipe,
        id: 1,
        name: "Initial recipe name 1",
        scheduling: true
      },
      {
        ...baseRecipe,
        id: 2,
        name: "Initial recipe name 2"
      }
    ])

    expect(
      recipes(
        beforeState,
        setSchedulingRecipe({ recipeID: 1, scheduling: true })
      )
    ).toEqual(afterState)
  })

  describe("duplicating recipe", () => {
    test("duplicating recipe", () => {
      const initialRecipe: IRecipe = {
        ...baseRecipe,
        id: 1,
        name: "Initial Recipe"
      }

      const duplicatedRecipe: IRecipe = {
        ...initialRecipe,
        id: 2,
        name: "Initial Recipe (copy)"
      }

      const startState = recipeStoreWith(initialRecipe)
      expect(startState.duplicatingById[initialRecipe.id]).toBeUndefined()

      const requestState = getModel(
        recipes(
          startState,
          duplicateRecipe.request({ recipeId: initialRecipe.id })
        )
      )
      expect(requestState.duplicatingById[initialRecipe.id]).toBe(true)

      const successState = recipes(
        requestState,
        duplicateRecipe.success(initialRecipe)
      )
      const successModel = getModel(successState)
      expect(successModel.duplicatingById[initialRecipe.id]).toBe(false)
      expect(Object.keys(successModel.byId)).toHaveLength(2)
      expect(successModel.byId[duplicatedRecipe.id]).toEqual(
        Success(duplicateRecipe)
      )
      assertCmdFuncEq(successState, duplicateRecipeAsync)

      const failureState = getModel(
        recipes(requestState, duplicateRecipe.success(initialRecipe))
      )
      expect(failureState.duplicatingById[initialRecipe.id]).toBe(false)
    })
    test("duplicateRecipeAsync", async () => {
      const recipeId = 123
      const dispatch = jest.fn()
      const successResponse: IRecipe = { ...baseRecipe, id: 144 }
      expect(successResponse.id).not.toEqual(recipeId)

      createHttpMocker()
        .onPost(`/api/v1/recipes/${recipeId}/duplicate/`)
        .replyOnce(200, successResponse)

      const callback = jest.fn()

      await duplicateRecipeAsync({ recipeId }, dispatch, callback)

      expect(callback).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledWith(
        duplicateRecipe.success(successResponse)
      )
      expect(dispatch).toHaveBeenCalledWith(push(recipeURL(successResponse.id)))
      expect(dispatch).not.toHaveBeenCalledWith(
        duplicateRecipe.failure(recipeId)
      )
    })
  })
})
