import recipes from './recipes.js'

import {
  addRecipe,
  removeRecipe,
  addStepToRecipe,
  addIngredientToRecipe,
  updateRecipeTime,
  updateRecipeAuthor,
  updateRecipeName,
  deleteIngredient,
  deleteStep,
  updateRecipeSource,
} from '../actions.js'

describe('Recipes', () => {
  it('Adds recipe to recipe list', () => {
    const beforeState = {
      1: {},
    }
    const recipe = {
      id: 123,
      title: 'Recipe title',
      tags: ['tagOne', 'tagTwo'],
      author: 'Recipe author',
      source: '',
      ingredients: ['ingredientOne', 'ingredientTwo'],
    }
    const afterState = {
      123: recipe,
      1: {},
    }
    expect(
      recipes(beforeState, addRecipe(recipe))
    ).toEqual(afterState)
  })

  it('Remove recipe from recipe list', () => {
    const beforeState = {
      123: {},
      1: {},
    }
    const afterState = {
      1: {},
    }
    expect(
      recipes(beforeState, removeRecipe(123))
    ).toEqual(afterState)
  })

  it('Remove non-existent recipe from recipe list', () => {
    expect(
      recipes({}, removeRecipe(123))
    ).toEqual({})
  })

  it('adds a step to the recipe', () => {
    const beforeState = {
      1: {
        title: 'good recipe',
        steps: [],
      },
    }

    const newStep = 'a new step'

    const afterState = {
      1: {
        title: 'good recipe',
        steps: [
          newStep,
        ],
      },
    }

    expect(
      recipes(beforeState, addStepToRecipe(1, newStep))
    ).toEqual(afterState)
  })

  it("adds an ingredient to the recipe and doesn't delete steps", () => {
    const beforeState = {
      1: {
        ingredients: [],
        steps: ['test'],
      },
    }

    const newIngredient = 'a new step'

    const afterState = {
      1: {
        ingredients: [
          newIngredient,
        ],
        steps: ['test'],
      },
    }

    expect(
      recipes(beforeState, addIngredientToRecipe(1, newIngredient))
    ).toEqual(afterState)
  })

  it('updates the name of the recipe', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'Before title',
      },
    }

    const newName = 'After title'

    const afterState = {
      1: {
        id: 1,
        name: newName,
      },
    }

    expect(
      recipes(beforeState, updateRecipeName(1, newName))
    ).toEqual(afterState)
  })

  it('deletes an ingredient from a recipe', () => {
    const beforeState = {
      1: {
        id: 1,
        ingredients: [
          'test', 'target',
        ],
      },
    }

    const afterState = {
      1: {
        id: 1,
        ingredients: [
          'test',
        ],
      },
    }
    expect(
      recipes(beforeState, deleteIngredient(1, 1))
    ).toEqual(afterState)
  })

  it('deletes a step from a recipe', () => {
    const beforeState = {
      1: {
        id: 1,
        steps: [
          'test', 'target',
        ],
      },
    }

    const afterState = {
      1: {
        id: 1,
        steps: [
          'test',
        ],
      },
    }

    expect(
      recipes(beforeState, deleteStep(1, 1))
    ).toEqual(afterState)
  })

  it('updates the recipe source', () => {
    const beforeState = {
      1: {
        id: 1,
        source: 'example.com',
      },
    }

    const newSource = 'abettersource.com'

    const afterState = {
      1: {
        id: 1,
        source: newSource,
      },
    }

    expect(
      recipes(beforeState, updateRecipeSource(1, newSource))
    ).toEqual(afterState)
  })

  it('updates the recipe author', () => {
    const beforeState = {
      1: {
        id: 1,
        author: 'donny',
      },
    }

    const newAuthor = 'aldo raine'

    const afterState = {
      1: {
        id: 1,
        author: newAuthor,
      },
    }

    expect(
      recipes(beforeState, updateRecipeAuthor(1, newAuthor))
    ).toEqual(afterState)
  })

  it('updates the recipe time', () => {
    const beforeState = {
      1: {
        id: 1,
        time: '1 hour',
      },
    }

    const newTime = '5.12 years'

    const afterState = {
      1: {
        id: 1,
        time: newTime,
      },
    }

    expect(
      recipes(beforeState, updateRecipeTime(1, newTime))
    ).toEqual(afterState)
  })
})
