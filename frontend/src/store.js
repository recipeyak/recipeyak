import { createStore, combineReducers } from 'redux'

import cart from './store/cart.js'
import { recipes } from './store/recipes.js'
import user from './store/user.js'

import { defaultRecipes } from './mock-data.js'

export const recipeApp = combineReducers({
  user,
  recipes,
  cart,
})

const defaultData = {
  recipes: defaultRecipes,
  cart: {
    1: 4,
    2: 0,
  },
}

// A "hydrated" store is nice for UI development
const store = createStore(recipeApp, defaultData)

// We need an empty store for the unit tests
export const emptyStore = createStore(recipeApp)

export default store
