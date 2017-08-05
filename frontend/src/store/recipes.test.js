import recipes from './recipes.js'
import {
  UPDATE_RECIPE_NAME,
  UPDATE_RECIPE_SOURCE,
  UPDATE_RECIPE_AUTHOR,
  UPDATE_RECIPE_TIME,
  DELETE_INGREDIENT,
  ADD_INGREDIENT_TO_RECIPE,
  ADD_RECIPE,
  REMOVE_RECIPE,
  ADD_STEP_TO_RECIPE,
  DELETE_STEP,
} from './actionTypes.js'

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
      recipes(beforeState, { type: ADD_RECIPE, recipe })
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
      recipes(beforeState, { type: REMOVE_RECIPE, id: 123 })
      ).toEqual(afterState)
  })

  it('Remove non-existent recipe from recipe list', () => {
    expect(
      recipes({}, { type: REMOVE_RECIPE, id: 123 })
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
      recipes(beforeState, { type: ADD_STEP_TO_RECIPE, id: 1, step: newStep })
    ).toEqual(afterState)
  })

  it("adds an ingredient to the recipe and doesn't delete steps", () => {
    const beforeState = {
      1: {
        ingredients: [],
        steps: [ 'test' ],
      },
    }

    const newIngredient = 'a new step'

    const afterState = {
      1: {
        ingredients: [
          newIngredient,
        ],
        steps: [ 'test' ],
      },
    }

    expect(
      recipes(beforeState, { type: ADD_INGREDIENT_TO_RECIPE, id: 1, ingredient: newIngredient })
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
      recipes(beforeState, { type: UPDATE_RECIPE_NAME, id: 1, name: newName })
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

    expect(recipes(beforeState, {
      type: DELETE_INGREDIENT,
      id: 1,
      index: 1,
    })).toEqual(afterState)
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

    expect(recipes(beforeState, {
      type: DELETE_STEP,
      id: 1,
      index: 1,
    })).toEqual(afterState)
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

    expect(recipes(beforeState, {
      type: UPDATE_RECIPE_SOURCE,
      id: 1,
      source: newSource,
    })).toEqual(afterState)
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

    expect(recipes(beforeState, {
      type: UPDATE_RECIPE_AUTHOR,
      id: 1,
      author: newAuthor,
    })).toEqual(afterState)
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

    expect(recipes(beforeState, {
      type: UPDATE_RECIPE_TIME,
      id: 1,
      time: newTime,
    })).toEqual(afterState)
  })
})
