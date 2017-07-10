import { createStore, combineReducers } from 'redux'

import cart from './store/cart.js'
import recipes from './store/recipes.js'
import user from './store/user.js'

export const recipeApp = combineReducers({
  user,
  recipes,
  cart,
})

const store = createStore(recipeApp)

export default store
