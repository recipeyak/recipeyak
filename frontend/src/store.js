import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import throttle from 'lodash/throttle'

import createHistory from 'history/createBrowserHistory'
import {
  routerReducer,
  routerMiddleware,
} from 'react-router-redux'

import cart from './store/cart.js'
import { recipes } from './store/recipes.js'
import user from './store/user.js'
import loading from './store/reducers/loading.js'
import error from './store/reducers/error.js'

import { defaultRecipes } from './mock-data.js'

export const recipeApp = combineReducers({
  user,
  recipes,
  cart,
  loading,
  error,
  routerReducer,
})

const getToken = () => {
  try {
    return localStorage.getItem('token')
  } catch (e) {
    return null
  }
}

const defaultData = {
  recipes: defaultRecipes,
  cart: {
    1: 4,
    2: 0,
  },
  user: {
    token: getToken(),
  },
}

export const history = createHistory()
const router = routerMiddleware(history)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// A "hydrated" store is nice for UI development
export const store = createStore(
  recipeApp,
  defaultData,
  composeEnhancers(
    applyMiddleware(thunk, router),
  )
)

store.subscribe(throttle(() => {
  try {
    localStorage.setItem('token', store.getState().user.token)
  } catch (e) {
    console.warn('failed to set store.user.token in localStorage')
  }
}, 1000))

// We need an empty store for the unit tests
export const emptyStore = createStore(recipeApp)

export default store
