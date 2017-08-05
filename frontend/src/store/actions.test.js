import {
  login,
  logout,
  addToCart,
  removeFromCart,
  addRecipe,
  removeRecipe,
} from './actions.js'

import {
  LOG_IN,
  LOG_OUT,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  ADD_RECIPE,
  REMOVE_RECIPE,
} from './actionTypes.js'

describe('Actions', () => {
  it('Should return LOG_IN action', () => {
    const expectedAction = {
      type: LOG_IN,
    }

    expect(
      login()
    ).toEqual(expectedAction)
  })

  it('Should return LOG_OUT action', () => {
    expect(
      logout()
    ).toEqual({
      type: LOG_OUT,
    })
  })

  it('Should return ADD_TO_CART action', () => {
    expect(
      addToCart()
    ).toEqual({
      type: ADD_TO_CART,
    })
  })

  it('Should return REMOVE_FROM_CART action', () => {
    expect(
      removeFromCart()
    ).toEqual({
      type: REMOVE_FROM_CART,
    })
  })

  it('Should return ADD_RECIPE action', () => {
    const recipe = {
      id: 123,
      title: 'Recipe title',
      tags: ['tagOne', 'tagTwo'],
      author: 'Recipe author',
      source: '',
      ingredients: ['ingredientOne', 'ingredientTwo'],
    }

    expect(
      addRecipe(recipe)
    ).toEqual({
      type: ADD_RECIPE,
      recipe,
    })
  })

  it('Should return REMOVE_RECIPE action', () => {
    const recipeId = 15

    expect(
      removeRecipe(recipeId)
    ).toEqual({
      type: REMOVE_RECIPE,
      id: recipeId,
    })
  })
})
