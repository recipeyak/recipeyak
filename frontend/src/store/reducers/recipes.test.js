import recipes from './recipes.js'

import {
  addRecipe,
  deleteRecipe,
  addStepToRecipe,
  addIngredientToRecipe,
  updateRecipeTime,
  updateRecipeAuthor,
  updateRecipeName,
  deleteIngredient,
  deleteStep,
  updateRecipeSource,
  updateIngredient,
  updateStep,
  setRecipeAddingToCart,
  setRecipeRemovingFromCart,
  setLoadingAddStepToRecipe,
  setLoadingRecipe,
  setDeletingRecipe
} from '../actions.js'

describe('Recipes', () => {
  it('Adds recipe to recipe list', () => {
    const beforeState = {
      1: {
        id: 1,
        title: 'a meh recipe'
      }
    }
    const recipe = {
      id: 123,
      title: 'Recipe title',
      tags: ['tagOne', 'tagTwo'],
      author: 'Recipe author',
      source: '',
      ingredients: [
        {
          text: 'ingredientOne'
        },
        {
          text: 'ingredientTwo'
        }
      ]
    }
    const afterState = {
      ...beforeState,
      [recipe.id]: recipe
    }
    expect(
      recipes(beforeState, addRecipe(recipe))
    ).toEqual(afterState)
  })

  it('Remove recipe from recipe list', () => {
    const beforeState = {
      123: {},
      1: {}
    }
    const afterState = {
      1: {}
    }
    expect(
      recipes(beforeState, deleteRecipe(123))
    ).toEqual(afterState)
  })

  it('Remove non-existent recipe from recipe list', () => {
    expect(
      recipes({}, deleteRecipe(123))
    ).toEqual({})
  })

  it('fetching recipe results in it loading', () => {
    const beforeState = {
      1: {
        title: 'good recipe',
        steps: [],
        loading: false
      }
    }

    const afterState = {
      1: {
        title: 'good recipe',
        steps: [],
        loading: true
      }
    }

    expect(
      recipes(beforeState, setLoadingRecipe(1, true))
    ).toEqual(afterState)
  })

  it('sets deleting of the recipe', () => {
    const beforeState = {
      1: {
        title: 'good recipe',
        steps: [],
        deleting: false
      }
    }

    const afterState = {
      1: {
        title: 'good recipe',
        steps: [],
        deleting: true
      }
    }

    expect(
      recipes(beforeState, setDeletingRecipe(1, true))
    ).toEqual(afterState)
  })

  it('adds a step to the recipe', () => {
    const beforeState = {
      1: {
        title: 'good recipe',
        steps: []
      }
    }

    const newStep = {
      text: 'a new step'
    }

    const afterState = {
      1: {
        title: 'good recipe',
        steps: [
          newStep
        ]
      }
    }

    expect(
      recipes(beforeState, addStepToRecipe(1, newStep))
    ).toEqual(afterState)
  })

  it("adds an ingredient to the recipe and doesn't delete steps", () => {
    const beforeState = {
      1: {
        ingredients: [],
        steps: [
          {
            text: 'test'
          }
        ]
      }
    }

    const newIngredient = {
      text: 'a new step'
    }

    const afterState = {
      1: {
        ingredients: [
          newIngredient
        ],
        steps: [
          {
            text: 'test'
          }
        ]
      }
    }

    expect(
      recipes(beforeState, addIngredientToRecipe(1, newIngredient))
    ).toEqual(afterState)
  })

  it('it updates a step', () => {
    const beforeState = {
      1: {
        ingredients: [
          {
            id: 1,
            text: 'a new step'
          }
        ],
        steps: [
          {
            id: 1,
            text: 'test'
          }
        ]
      }
    }

    const text = 'new text'

    const afterState = {
      1: {
        ingredients: [
          {
            id: 1,
            text: 'a new step'
          }
        ],
        steps: [
          {
            id: 1,
            text: text
          }
        ]
      }
    }

    expect(
      recipes(beforeState, updateStep(1, 1, text))
    ).toEqual(afterState)
  })

  it('it updates an ingredient', () => {
    const beforeState = {
      1: {
        ingredients: [
          {
            id: 1,
            quantity: 2,
            unit: 'count',
            name: 'Tomato',
            description: 'sliced'
          }
        ],
        steps: [
          {
            text: 'test'
          }
        ]
      }
    }

    const newIngredient = {
      id: 1,
      quantity: 4,
      unit: 'count',
      name: 'Tomato',
      description: 'diced'
    }

    const afterState = {
      1: {
        ingredients: [
          newIngredient
        ],
        steps: [
          {
            text: 'test'
          }
        ]
      }
    }

    expect(
      recipes(beforeState, updateIngredient(1, 1, newIngredient))
    ).toEqual(afterState)
  })

  it('updates the name of the recipe', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'Before title'
      }
    }

    const newName = 'After title'

    const afterState = {
      1: {
        id: 1,
        name: newName
      }
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
          {
            id: 1,
            text: 'test'
          },
          {
            id: 2,
            text: 'target'
          }
        ]
      }
    }

    const afterState = {
      1: {
        id: 1,
        ingredients: [
          {
            id: 2,
            text: 'target'
          }
        ]
      }
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
          {
            id: 1,
            text: 'test'
          },
          {
            id: 2,
            text: 'target'
          }
        ]
      }
    }

    const afterState = {
      1: {
        id: 1,
        steps: [
          {
            id: 2,
            text: 'target'
          }
        ]
      }
    }

    expect(
      recipes(beforeState, deleteStep(1, 1))
    ).toEqual(afterState)
  })

  it('updates the recipe source', () => {
    const beforeState = {
      1: {
        id: 1,
        source: 'example.com'
      }
    }

    const newSource = 'abettersource.com'

    const afterState = {
      1: {
        id: 1,
        source: newSource
      }
    }

    expect(
      recipes(beforeState, updateRecipeSource(1, newSource))
    ).toEqual(afterState)
  })

  it('updates the recipe author', () => {
    const beforeState = {
      1: {
        id: 1,
        author: 'donny'
      }
    }

    const newAuthor = 'aldo raine'

    const afterState = {
      1: {
        id: 1,
        author: newAuthor
      }
    }

    expect(
      recipes(beforeState, updateRecipeAuthor(1, newAuthor))
    ).toEqual(afterState)
  })

  it('updates the recipe time', () => {
    const beforeState = {
      1: {
        id: 1,
        time: '1 hour'
      }
    }

    const newTime = '5.12 years'

    const afterState = {
      1: {
        id: 1,
        time: newTime
      }
    }

    expect(
      recipes(beforeState, updateRecipeTime(1, newTime))
    ).toEqual(afterState)
  })

  it('set recipe to be in the adding to cart state', () => {
    const beforeState = {
      1: {
        id: 1,
        addingToCart: false
      }
    }

    const afterState = {
      1: {
        id: 1,
        addingToCart: true
      }
    }

    expect(
      recipes(beforeState, setRecipeAddingToCart(1, true))
    ).toEqual(afterState)
  })

  it('set recipe to be in the removing from cart state', () => {
    const beforeState = {
      1: {
        id: 1,
        removingFromCart: false
      }
    }

    const afterState = {
      1: {
        id: 1,
        removingFromCart: true
      }
    }

    expect(
      recipes(beforeState, setRecipeRemovingFromCart(1, true))
    ).toEqual(afterState)
  })


  it("sets the loading state for adding a step to a recipe", () => {
    const beforeState = {
      1: {
        addingStepToRecipe: false,
      }
    }

    const afterState = {
      1: {
        addingStepToRecipe: true
      }
    }

    expect(
      recipes(beforeState, setLoadingAddStepToRecipe(1, true))
    ).toEqual(afterState)
  })
})
