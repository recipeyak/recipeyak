import {emptyStore as store} from './store.js'
import {login, logout, addToCart, removeFromCart, addRecipe, removeRecipe} from './store/actions.js'

describe('Store', () => {
it('Should handle user actions', () => {
  store.dispatch(login())
  expect(store.getState().user).toEqual({loggedIn: true})
  store.dispatch(logout())
  expect(store.getState().user).toEqual({loggedIn: false})
})

it('Should handle cart actions', () => {
  const recipeId = 15
  store.dispatch(addToCart(recipeId))
  expect(store.getState().cart).toEqual({15: 1})
  store.dispatch(removeFromCart(recipeId))
  expect(store.getState().cart).toEqual({15: 0})
})

it('Should handle recipe actions', () => {
  const recipe = {
    id: 123,
    title: 'Recipe title',
    tags: ['tagOne', 'tagTwo'],
    author: 'Recipe author',
    source: '',
    ingredients: ['ingredientOne', 'ingredientTwo'],
  }
  store.dispatch(addRecipe(recipe))
  expect(store.getState().recipes).toEqual({123: recipe})
  store.dispatch(removeRecipe(recipe.id))
  expect(store.getState().recipes).toEqual({})
})
})
