import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Reducer
} from "redux"
import throttle from "lodash/throttle"

import createHistory from "history/createBrowserHistory"
import {
  routerReducer,
  routerMiddleware,
  RouterState,
  RouterAction
} from "react-router-redux"

import recipes, { IRecipesState, RecipeActions } from "@/store/reducers/recipes"
import user, {
  SET_USER_LOGGED_IN,
  IUserState,
  UserActions
} from "@/store/reducers/user"
import loading, {
  ILoadingState,
  LoadingActions
} from "@/store/reducers/loading"
import notification, {
  INotificationState,
  NotificationsActions
} from "@/store/reducers/notification"
import passwordChange, {
  IPasswordChangeState,
  PasswordChangeActions
} from "@/store/reducers/passwordChange"
import shoppinglist, {
  IShoppingListState,
  ShoppingListActions
} from "@/store/reducers/shoppinglist"
import addrecipe, {
  IAddRecipeState,
  AddRecipeActions
} from "@/store/reducers/addrecipe"
import auth, { IAuthState, AuthActions } from "@/store/reducers/auth"
import teams, { ITeamsState, TeamsActions } from "@/store/reducers/teams"
import invites, { InviteActions, IInvitesState } from "@/store/reducers/invites"
import calendar, {
  ICalendarState,
  CalendarActions
} from "@/store/reducers/calendar"
import search, { ISearchState, SearchActions } from "@/store/reducers/search"

import { loadState, saveState } from "@/store/localStorage"
import { StateType } from "typesafe-actions"
import { createLogger } from "redux-logger"
import { DEBUG } from "@/settings"

interface IState {
  readonly user: IUserState
  readonly recipes: IRecipesState
  readonly invites: IInvitesState
  readonly loading: ILoadingState
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

export const history = createHistory()
const router = routerMiddleware(history)

const composeEnhancers: typeof compose =
  // tslint:disable-next-line no-any no-unsafe-any
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// We need an empty store for the unit tests
export const emptyStore = createStore(
  rootReducer,
  {},
  composeEnhancers(applyMiddleware(router))
)

// NOTE(sbdchd): this is hacky, we should validate the local storage state before using it
const defaultData = (): RootState => {
  const saved = loadState()
  const empty = emptyStore.getState()

  if (saved == null || saved instanceof SyntaxError) {
    return empty
  }

  return {
    ...empty,
    ...saved,
    user: {
      ...empty.user,
      ...saved.user
    }
  }
}

const middleware = [router]
if (DEBUG) {
  middleware.push(createLogger({ collapsed: true }))
}

// A "hydrated" store is nice for UI development
export const store = createStore(
  rootReducer,
  defaultData(),
  composeEnhancers(applyMiddleware(...middleware))
)

store.subscribe(
  throttle(() => {
    saveState(({
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
      // tslint:disable-next-line:no-any
    } as any) as RootState)
  }, 1000)
)

export default store
