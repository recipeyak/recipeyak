import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Reducer
} from "redux"
import thunk from "redux-thunk"
import throttle from "lodash/throttle"

import createHistory from "history/createBrowserHistory"
import {
  routerReducer,
  routerMiddleware,
  RouterState,
  RouterAction
} from "react-router-redux"

import recipes, { IRecipesState, RecipeActions } from "./reducers/recipes"
import user, {
  SET_USER_LOGGED_IN,
  IUserState,
  UserActions
} from "./reducers/user"
import loading, { ILoadingState, LoadingActions } from "./reducers/loading"
import error, { IErrorState, ErrorActions } from "./reducers/error"
import notification, {
  INotificationState,
  NotificationsActions
} from "./reducers/notification"
import passwordChange, {
  IPasswordChangeState,
  PasswordChangeActions
} from "./reducers/passwordChange"
import shoppinglist, {
  IShoppingListState,
  ShoppingListActions
} from "./reducers/shoppinglist"
import addrecipe, {
  IAddRecipeState,
  AddRecipeActions
} from "./reducers/addrecipe"
import auth, { IAuthState, AuthActions } from "./reducers/auth"
import teams, { ITeamsState, TeamsActions } from "./reducers/teams"
import invites, { InviteActions, IInvitesState } from "./reducers/invites"
import calendar, { ICalendarState, CalendarActions } from "./reducers/calendar"
import search, { ISearchState, SearchActions } from "./reducers/search"

import { loadState, saveState } from "./localStorage"
import { StateType } from "typesafe-actions"

interface IState {
  readonly user: IUserState
  readonly recipes: IRecipesState
  readonly invites: IInvitesState
  readonly loading: ILoadingState
  readonly error: IErrorState
  readonly routerReducer: RouterState
  readonly notification: INotificationState
  readonly passwordChange: IPasswordChangeState
  readonly shoppinglist: IShoppingListState
  readonly addrecipe: IAddRecipeState
  readonly auth: IAuthState
  readonly teams: ITeamsState
  readonly calendar: ICalendarState
  readonly search: ISearchState
}

export type Action =
  | UserActions
  | RecipeActions
  | InviteActions
  | LoadingActions
  | NotificationsActions
  | ErrorActions
  | RouterAction
  | PasswordChangeActions
  | ShoppingListActions
  | AddRecipeActions
  | AuthActions
  | TeamsActions
  | CalendarActions
  | SearchActions

const recipeApp: Reducer<IState, Action> = combineReducers({
  user,
  recipes,
  invites,
  loading,
  error,
  routerReducer,
  notification,
  passwordChange,
  shoppinglist,
  addrecipe,
  auth,
  teams,
  calendar,
  search
})

export type RootState = StateType<typeof rootReducer>

// reset redux to default state on logout
export function rootReducer(state: IState | undefined, action: Action): IState {
  if (state == null) {
    return recipeApp(undefined, action)
  }
  if (action.type === SET_USER_LOGGED_IN && !action.payload) {
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

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// A "hydrated" store is nice for UI development
export const store = createStore(
  rootReducer,
  defaultData,
  composeEnhancers(applyMiddleware(thunk, router))
)

store.subscribe(
  throttle(() => {
    saveState({
      user: {
        // We assume this is true and if the session expires we have axios interceptors
        // to set this to false. In that _rare_ case, there will be a slight flash, but
        // this is acceptable for us for the added performance
        loggedIn: store.getState().user.loggedIn,
        darkMode: store.getState().user.darkMode,
        teamID: store.getState().user.teamID
      },
      addrecipe: store.getState().addrecipe,
      auth: store.getState().auth
    })
  }, 1000)
)

// We need an empty store for the unit tests
export const emptyStore = createStore(
  rootReducer,
  {},
  composeEnhancers(applyMiddleware(thunk, router))
)
export default store
