import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import cart from './store/cart.js'
import { recipes } from './store/recipes.js'
import user from './store/user.js'
import loading from './store/reducers/loading.js'

import { defaultRecipes } from './mock-data.js'

export const recipeApp = combineReducers({
  user,
  recipes,
  cart,
  loading,
})

const defaultData = {
  recipes: defaultRecipes,
  cart: {
    1: 4,
    2: 0,
  },
}

// A "hydrated" store is nice for UI development
const store = createStore(
  recipeApp,
  defaultData,
  applyMiddleware(thunk),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

// We need an empty store for the unit tests
export const emptyStore = createStore(recipeApp)

export default store
