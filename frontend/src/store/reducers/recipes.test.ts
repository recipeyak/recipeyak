import recipes, {
  IRecipesState,
  IRecipe,
  IIngredient,
  IStep
} from "@/store/reducers/recipes"

import * as a from "@/store/reducers/recipes"

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
    return recipes(undefined, a.setRecipes(recipe))
  }
  return recipes(undefined, a.setRecipe(recipe.id, recipe))
}

describe("Recipes", () => {
  it("Adds recipe to recipe list", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      id: 1,
      name: "a meh recipe"
    })
    const recipe: IRecipe = {
      ...baseRecipe,
      id: 123,
      name: "Recipe title",
      author: "Recipe author",
      source: "",
      ingredients: [baseIngredient, baseIngredient]
    }
    const afterState: IRecipesState = {
      ...beforeState,
      [recipe.id]: recipe
    }
    expect(recipes(beforeState, a.addRecipe(recipe))).toEqual(afterState)
  })

  it("Remove recipe from recipe list", () => {
    const beforeState: IRecipesState = recipeStoreWith([
      {
        ...baseRecipe,
        id: 123
      },
      {
        ...baseRecipe,
        id: 1
      }
    ])
    const afterState: IRecipesState = {
      byId: {
        1: baseRecipe
      },
      allIds: [1]
    }
    expect(recipes(beforeState, a.deleteRecipe.success(123))).toEqual(
      afterState
    )
  })

  it("Remove non-existent recipe from recipe list", () => {
    expect(
      recipes({ byId: {}, allIds: [] }, a.deleteRecipe.success(123))
    ).toEqual({
      byId: {},
      allIds: []
    })
  })

  it("fetching recipe results in it loading", () => {
    const beforeState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          name: "good recipe",
          steps: [],
          loading: false
        }
      },
      allIds: [1]
    }

    const afterState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          name: "good recipe",
          steps: [],
          loading: true
        }
      },
      allIds: [1]
    }

    expect(recipes(beforeState, a.setLoadingRecipe(1, true))).toEqual(
      afterState
    )
  })

  it("sets deleting of the recipe", () => {
    const beforeState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          name: "good recipe",
          steps: [],
          deleting: false
        }
      },
      allIds: [1]
    }

    const afterState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          name: "good recipe",
          steps: [],
          deleting: true
        }
      },
      allIds: [1]
    }

    expect(recipes(beforeState, a.deleteRecipe.request(1))).toEqual(afterState)
    expect(recipes(afterState, a.deleteRecipe.failure(1))).toEqual(beforeState)
  })

  it("adds a step to the recipe", () => {
    const beforeState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          name: "good recipe",
          steps: []
        }
      },
      allIds: [1]
    }

    const newStep = {
      ...baseStep,
      id: 1,
      text: "a new step",
      position: 10
    }

    const afterState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          name: "good recipe",
          steps: [newStep]
        }
      },
      allIds: [1]
    }

    expect(recipes(beforeState, a.addStepToRecipe(1, newStep))).toEqual(
      afterState
    )
  })

  it("adds an ingredient to the recipe and doesn't delete steps", () => {
    const beforeState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          ingredients: [],
          steps: [
            {
              id: 1,
              text: "test",
              position: 10
            }
          ]
        }
      },
      allIds: [1]
    }

    const newIngredient = baseIngredient

    const afterState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          ingredients: [newIngredient],
          steps: [
            {
              id: 1,
              text: "test",
              position: 10
            }
          ]
        }
      },
      allIds: [1]
    }

    expect(
      recipes(beforeState, a.addIngredientToRecipe(1, newIngredient))
    ).toEqual(afterState)
  })

  it("updates a step", () => {
    const beforeState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          ingredients: [baseIngredient],
          steps: [
            {
              id: 1,
              text: "test",
              position: 2.54
            }
          ]
        }
      },
      allIds: [1]
    }

    const text = "new text"
    const position = 10.0

    const afterState: IRecipesState = {
      byId: {
        1: {
          ...baseRecipe,
          ingredients: [baseIngredient],
          steps: [
            {
              id: 1,
              text,
              position
            }
          ]
        }
      },
      allIds: [1]
    }

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

  it("updates the name of the recipe", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      name: "Before title"
    })

    const newName = "After title"

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      name: newName
    })

    expect(recipes(beforeState, a.updateRecipeName(1, newName))).toEqual(
      afterState
    )
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

  it("updates the recipe source", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      source: "example.com"
    })

    const newSource = "abettersource.com"

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      source: newSource
    })

    expect(recipes(beforeState, a.updateRecipeSource(1, newSource))).toEqual(
      afterState
    )
  })

  it("updates the recipe author", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      author: "donny"
    })
    const newAuthor = "aldo raine"

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      author: newAuthor
    })

    expect(recipes(beforeState, a.updateRecipeAuthor(1, newAuthor))).toEqual(
      afterState
    )
  })

  it("updates the recipe time", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      time: "1 hour"
    })
    const newTime = "5.12 years"

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      time: newTime
    })

    expect(recipes(beforeState, a.updateRecipeTime(1, newTime))).toEqual(
      afterState
    )
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

  it("sets the recipe to 404", () => {
    const beforeState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      error404: false
    })

    const afterState: IRecipesState = recipeStoreWith({
      ...baseRecipe,
      error404: true
    })
    expect(recipes(beforeState, a.setRecipe404(1, true))).toEqual(afterState)
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
      name: "new recipe name",
      updating: true
    })

    expect(recipes(beforeState, a.setRecipe(1, newRecipe))).toEqual(afterState)
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
      name: "new recipe name",
      updating: true
    })

    expect(recipes(beforeState, a.setRecipe(1, newRecipe))).toEqual(afterState)
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
