import recipes, {
  IRecipesState,
  IRecipe,
  IIngredient,
  IStep
} from "@/store/reducers/recipes"

import * as a from "@/store/reducers/recipes"
import { RootState } from "@/store/store"
import { RDK, HttpErrorKind } from "@/store/remotedata"

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
  ingredients: []
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
    return recipes(undefined, a.fetchRecipeList.success(recipe))
  }
  return recipes(undefined, a.fetchRecipe.success(recipe))
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
    const after = recipes(beforeState, a.deleteRecipe.success(first.id))
    expect(after.allIds).toEqual([second.id])
    expect(after.byId[first.id]).toEqual(undefined)

    const maybeSecond = a.getRecipeById(
      { recipes: beforeState } as RootState,
      second.id
    )
    expect(maybeSecond).not.toBeUndefined()
    expect(maybeSecond).not.toBeNull()
    if (maybeSecond == null) {
      return
    }

    expect(maybeSecond.kind).toEqual(RDK.Success)
    if (maybeSecond.kind === RDK.Success) {
      expect(maybeSecond.data).toEqual(second)
    }
  })

  it("Remove non-existent recipe from recipe list", () => {
    expect(recipes(a.initialState, a.deleteRecipe.success(123))).toEqual(
      a.initialState
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

    expect(recipes(beforeState, a.deleteRecipe.request(1))).toEqual(afterState)
    expect(recipes(afterState, a.deleteRecipe.failure(1))).toEqual(beforeState)
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
      steps: [newStep]
    })

    expect(recipes(beforeState, a.addStepToRecipe(1, newStep))).toEqual(
      afterState
    )
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
      ]
    })

    expect(
      recipes(beforeState, a.addIngredientToRecipe(1, newIngredient))
    ).toEqual(afterState)
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
          position
        }
      ]
    })

    expect(recipes(beforeState, a.updateStep(1, 1, text, position))).toEqual(
      afterState
    )
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
      ingredients: [newIngredient],
      steps: [baseStep]
    })

    expect(
      recipes(beforeState, a.updateIngredient(1, 1, newIngredient))
    ).toEqual(afterState)
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
    expect(recipes(beforeState, a.deleteIngredient(1, 1))).toEqual(afterState)
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

    expect(recipes(beforeState, a.deleteStep(1, 1))).toEqual(afterState)
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

    expect(recipes(beforeState, a.setLoadingAddStepToRecipe(1, true))).toEqual(
      afterState
    )
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
      recipes(beforeState, a.setAddingIngredientToRecipe(1, true))
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

    expect(recipes(beforeState, a.setUpdatingIngredient(1, 1, true))).toEqual(
      afterState
    )
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

    expect(recipes(beforeState, a.setRemovingIngredient(1, 1, true))).toEqual(
      afterState
    )
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

    expect(recipes(beforeState, a.setUpdatingStep(1, 1, true))).toEqual(
      afterState
    )
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
    expect(recipes(beforeState, a.setRemovingStep(1, 1, true))).toEqual(
      afterState
    )
  })

  it("fetch recipe works", () => {
    const beforeState: IRecipesState = a.initialState
    const fetchingState = {
      loadingAll: false,
      errorLoadingAll: false,
      byId: {
        [baseRecipe.id]: {
          kind: RDK.Loading
        }
      },
      allIds: []
    }
    const fetchingActual = recipes(
      beforeState,
      a.fetchRecipe.request(baseRecipe.id)
    )
    expect(fetchingActual.byId).toEqual(fetchingState.byId)
    expect(fetchingActual.allIds).toEqual(fetchingState.allIds)

    const successState: IRecipesState = recipeStoreWith({
      ...baseRecipe
    })
    expect(recipes(beforeState, a.fetchRecipe.success(baseRecipe))).toEqual(
      successState
    )

    const failureState = {
      loadingAll: false,
      errorLoadingAll: false,
      byId: {
        [baseRecipe.id]: {
          kind: RDK.Failure,
          failure: HttpErrorKind.error404
        }
      },
      allIds: []
    }

    const failActual = recipes(
      beforeState,
      a.fetchRecipe.failure({ id: 1, error404: true })
    )
    expect(failActual.byId).toEqual(failureState.byId)
    expect(failActual.allIds).toEqual(failureState.allIds)
  })

  it("sets the recipe to updating", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      updating: false
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      updating: true
    })

    expect(recipes(beforeState, a.setRecipeUpdating(1, true))).toEqual(
      afterState
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

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      name: "new recipe name"
    })

    expect(recipes(beforeState, a.fetchRecipe.success(newRecipe))).toEqual(
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

    expect(recipes(beforeState, a.updateRecipeOwner(id, owner))).toEqual(
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

    expect(recipes(beforeState, a.setSchedulingRecipe(1, true))).toEqual(
      afterState
    )
  })
})
