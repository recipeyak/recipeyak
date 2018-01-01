import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import throttle from 'lodash/throttle'

import createHistory from 'history/createBrowserHistory'
import {
  routerReducer,
  routerMiddleware
} from 'react-router-redux'

import cart from './reducers/cart.js'
import recipes from './reducers/recipes.js'
import user from './reducers/user.js'
import loading from './reducers/loading.js'
import error from './reducers/error.js'
import notification from './reducers/notification.js'
import passwordChange from './reducers/passwordChange.js'
import shoppinglist from './reducers/shoppinglist.js'

import { loadState, saveState } from './localStorage'

import { LOG_OUT } from './actionTypes'

const recipeApp = combineReducers({
  user,
  recipes,
  cart,
  loading,
  error,
  routerReducer,
  notification,
  passwordChange,
  shoppinglist
})

// reset redux to default state on logout
export const rootReducer = (state, action) => {
  if (action.type === LOG_OUT) {
    state = undefined
  }
  return recipeApp(state, action)
}

const defaultData = loadState()

export const history = createHistory()
const router = routerMiddleware(history)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// A "hydrated" store is nice for UI development
export const store = createStore(
  rootReducer,
  defaultData,
  composeEnhancers(
    applyMiddleware(thunk, router)
  )
)

store.subscribe(throttle(() => {
  saveState({
    user: {
      token: store.getState().user.token
    }
  })
}, 1000))

// We need an empty store for the unit tests
export const emptyStore = createStore(
  rootReducer,
  {},
  composeEnhancers(
    applyMiddleware(thunk, router)
  )
)
export default store
