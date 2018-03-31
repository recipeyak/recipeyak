import { createStore, combineReducers, applyMiddleware, compose, ReducersMapObject} from 'redux'
import thunk from 'redux-thunk'
import { throttle } from 'lodash'

import createHistory from 'history/createBrowserHistory'
import {
  routerReducer,
  routerMiddleware,
  RouterState,
} from 'react-router-redux'

import cart, { CartState } from './reducers/cart'
import recipes, { RecipesState } from './reducers/recipes'
import user, { UserState } from './reducers/user'
import loading, { LoadingState } from './reducers/loading'
import error, { ErrorState } from './reducers/error'
import notification, { NotificationState } from './reducers/notification'
import passwordChange, { PasswordChangeState } from './reducers/passwordChange'
import shoppinglist, { ShoppingListState } from './reducers/shoppinglist'
import addrecipe, { AddRecipeState } from './reducers/addrecipe'
import auth, { AuthState } from './reducers/auth'
import teams, { TeamState } from './reducers/teams'
import invites, { InvitesState } from './reducers/invites'

import { loadState, saveState } from './localStorage'

import { LOG_OUT } from './actionTypes'

export interface StateTree {
  cart: CartState
  recipes: RecipesState
  user: UserState
  loading: LoadingState
  error: ErrorState
  notification: NotificationState
  passwordChange: PasswordChangeState
  shoppinglist: ShoppingListState
  addRecipe: AddRecipeState
  auth: AuthState
  teams: TeamState
  invites: InvitesState
  routerReducer: RouterState
}

const recipeApp = combineReducers({
  user,
  recipes,
  invites,
  cart,
  loading,
  error,
  routerReducer,
  notification,
  passwordChange,
  shoppinglist,
  addrecipe,
  auth,
  teams,
} as ReducersMapObject)

// reset redux to default state on logout
// TODO: add sum type of actions
export const rootReducer = (state: StateTree, action: any) => {
  if (action.type === LOG_OUT) {
    return {
      ...recipeApp(undefined, action),
      // We need to save this auth state (fromUrl) through logout
      // so we can redirect users to where they were attempting to
      // visit before being asked for authentication
      auth: state.auth,
      routerReducer: state.routerReducer
    }
  }
  return recipeApp(state, action)
}

const defaultData = loadState()

export const history = createHistory()
const router = routerMiddleware(history)

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

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
      token: store.getState().user.token,
      darkMode: store.getState().user.darkMode
    },
    addrecipe: store.getState().addrecipe,
    auth: store.getState().auth,
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
