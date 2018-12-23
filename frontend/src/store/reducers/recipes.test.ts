import recipes, { IRecipesState, IRecipe, IIngredient, IStep } from "./recipes"

import * as a from "../actions"

const baseRecipe: IRecipe = {
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

const baseIngredient: IIngredient = {
  id: 1,
  name: "foo",
  quantity: "1 cup",
  description: "chopped",
  position: 12.3,
  optional: false
}

const baseStep: IStep = {
  id: 1,
  text: "foo",
  position: 10
}

describe("Recipes", () => {
  it("Adds recipe to recipe list", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        id: 1,
        name: "a meh recipe"
      }
    }
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
    const beforeState = {
      123: baseRecipe,
      1: baseRecipe
    }
    const afterState = {
      1: baseRecipe
    }
    expect(recipes(beforeState, a.deleteRecipe(123))).toEqual(afterState)
  })

  it("Remove non-existent recipe from recipe list", () => {
    expect(recipes({}, a.deleteRecipe(123))).toEqual({})
  })

  it("fetching recipe results in it loading", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "good recipe",
        steps: [],
        loading: false
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "good recipe",
        steps: [],
        loading: true
      }
    }

    expect(recipes(beforeState, a.setLoadingRecipe(1, true))).toEqual(
      afterState
    )
  })

  it("sets deleting of the recipe", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "good recipe",
        steps: [],
        deleting: false
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "good recipe",
        steps: [],
        deleting: true
      }
    }

    expect(recipes(beforeState, a.setDeletingRecipe(1, true))).toEqual(
      afterState
    )
  })

  it("adds a step to the recipe", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "good recipe",
        steps: []
      }
    }

    const newStep = {
      id: 1,
      text: "a new step",
      position: 10
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "good recipe",
        steps: [newStep]
      }
    }

    expect(recipes(beforeState, a.addStepToRecipe(1, newStep))).toEqual(
      afterState
    )
  })

  it("adds an ingredient to the recipe and doesn't delete steps", () => {
    const beforeState: IRecipesState = {
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
    }

    const newIngredient = baseIngredient

    const afterState: IRecipesState = {
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
    }

    expect(
      recipes(beforeState, a.addIngredientToRecipe(1, newIngredient))
    ).toEqual(afterState)
  })

  it("it updates a step", () => {
    const beforeState: IRecipesState = {
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
    }

    const text = "new text"
    const position = 10.0

    const afterState = {
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
    }

    expect(recipes(beforeState, a.updateStep(1, 1, text, position))).toEqual(
      afterState
    )
  })

  it("it updates an ingredient", () => {
    const beforeState: IRecipesState = {
      1: {
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
      }
    }

    const newIngredient: IIngredient = {
      ...baseIngredient,
      id: 1,
      quantity: "4 count",
      name: "Tomato",
      description: "diced"
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        ingredients: [newIngredient],
        steps: [baseStep]
      }
    }

    expect(
      recipes(beforeState, a.updateIngredient(1, 1, newIngredient))
    ).toEqual(afterState)
  })

  it("updates the name of the recipe", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "Before title"
      }
    }

    const newName = "After title"

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: newName
      }
    }

    expect(recipes(beforeState, a.updateRecipeName(1, newName))).toEqual(
      afterState
    )
  })

  it("deletes an ingredient from a recipe", () => {
    const beforeState: IRecipesState = {
      1: {
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
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        id: 1,
        ingredients: [
          {
            ...baseIngredient,
            id: 2
          }
        ]
      }
    }
    expect(recipes(beforeState, a.deleteIngredient(1, 1))).toEqual(afterState)
  })

  it("deletes a step from a recipe", () => {
    const beforeState: IRecipesState = {
      1: {
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
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        steps: [
          {
            ...baseStep,
            id: 2,
            text: "target"
          }
        ]
      }
    }

    expect(recipes(beforeState, a.deleteStep(1, 1))).toEqual(afterState)
  })

  it("updates the recipe source", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        source: "example.com"
      }
    }

    const newSource = "abettersource.com"

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        source: newSource
      }
    }

    expect(recipes(beforeState, a.updateRecipeSource(1, newSource))).toEqual(
      afterState
    )
  })

  it("updates the recipe author", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        author: "donny"
      }
    }

    const newAuthor = "aldo raine"

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        author: newAuthor
      }
    }

    expect(recipes(beforeState, a.updateRecipeAuthor(1, newAuthor))).toEqual(
      afterState
    )
  })

  it("updates the recipe time", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        time: "1 hour"
      }
    }

    const newTime = "5.12 years"

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        time: newTime
      }
    }

    expect(recipes(beforeState, a.updateRecipeTime(1, newTime))).toEqual(
      afterState
    )
  })

  it("sets the loading state for adding a step to a recipe", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        addingStepToRecipe: false
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        addingStepToRecipe: true
      }
    }

    expect(recipes(beforeState, a.setLoadingAddStepToRecipe(1, true))).toEqual(
      afterState
    )
  })

  it("sets the recipe to be adding an ingredient", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        addingIngredient: false
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        addingIngredient: true
      }
    }

    expect(
      recipes(beforeState, a.setAddingIngredientToRecipe(1, true))
    ).toEqual(afterState)
  })

  it("sets the recipe to be updating a specific ingredient", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        ingredients: [
          {
            ...baseIngredient,
            updating: false
          }
        ]
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        ingredients: [
          {
            ...baseIngredient,
            updating: true
          }
        ]
      }
    }

    expect(recipes(beforeState, a.setUpdatingIngredient(1, 1, true))).toEqual(
      afterState
    )
  })

  it("sets the recipe to be removing a specific ingredient", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        ingredients: [
          {
            ...baseIngredient,
            removing: false
          }
        ]
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        ingredients: [
          {
            ...baseIngredient,
            removing: true
          }
        ]
      }
    }

    expect(recipes(beforeState, a.setRemovingIngredient(1, 1, true))).toEqual(
      afterState
    )
  })

  it("sets the recipe to be updating a specific step", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        steps: [
          {
            ...baseStep,
            updating: false
          }
        ]
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        steps: [
          {
            ...baseStep,
            updating: true
          }
        ]
      }
    }

    expect(recipes(beforeState, a.setUpdatingStep(1, 1, true))).toEqual(
      afterState
    )
  })

  it("sets the recipe to be removing a specific step", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        steps: [
          {
            ...baseStep,
            id: 1,
            text: "a new step",
            removing: false
          }
        ]
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        steps: [
          {
            ...baseStep,
            id: 1,
            text: "a new step",
            removing: true
          }
        ]
      }
    }

    expect(recipes(beforeState, a.setRemovingStep(1, 1, true))).toEqual(
      afterState
    )
  })

  it("sets the recipe to 404", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        error404: false
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        error404: true
      }
    }

    expect(recipes(beforeState, a.setRecipe404(1, true))).toEqual(afterState)
  })

  it("sets the recipe to updating", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        updating: false
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        updating: true
      }
    }

    expect(recipes(beforeState, a.setRecipeUpdating(1, true))).toEqual(
      afterState
    )
  })

  it("overwrites the recipe correctly", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "Initial recipe name",
        updating: true
      }
    }

    const newRecipe = {
      name: "new recipe name"
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        name: "new recipe name",
        updating: true
      }
    }

    expect(recipes(beforeState, a.setRecipe(1, newRecipe))).toEqual(afterState)
  })

  it("sets recipe owner for recipe move", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        id: 1,
        name: "Initial recipe name 1"
      },
      2: {
        ...baseRecipe,
        id: 2,
        name: "Initial recipe name 2"
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        id: 1,
        name: "Initial recipe name 1",
        owner: {
          id: 14,
          type: "team",
          name: "A Cool Name"
        }
      },
      2: {
        ...baseRecipe,
        id: 2,
        name: "Initial recipe name 2"
      }
    }

    const id = 1
    const owner = {
      id: 14,
      type: "team",
      name: "A Cool Name"
    }

    expect(recipes(beforeState, a.updateRecipeOwner(id, owner))).toEqual(
      afterState
    )
  })

  it("sets recipe owner for recipe move", () => {
    const beforeState: IRecipesState = {
      1: {
        ...baseRecipe,
        id: 1,
        name: "Initial recipe name 1"
      },
      2: {
        ...baseRecipe,
        id: 2,
        name: "Initial recipe name 2"
      }
    }

    const afterState: IRecipesState = {
      1: {
        ...baseRecipe,
        id: 1,
        name: "Initial recipe name 1",
        scheduling: true
      },
      2: {
        ...baseRecipe,
        id: 2,
        name: "Initial recipe name 2"
      }
    }

    expect(recipes(beforeState, a.setSchedulingRecipe(1, true))).toEqual(
      afterState
    )
  })
})
