import {
  createStore as basicCreateStore,
  applyMiddleware,
  compose as reduxCompose,
  Store as ReduxStore,
  StoreEnhancer,
  Dispatch as ReduxDispatch
} from "redux"

import {
  combineReducers,
  LoopReducer,
  Loop,
  StoreCreator,
  install,
  ReducerMapObject
} from "redux-loop"

import throttle from "lodash/throttle"

import createHistory from "history/createBrowserHistory"
import {
  routerReducer,
  routerMiddleware,
  RouterState,
  RouterAction
} from "react-router-redux"

import recipes, { IRecipesState, RecipeActions } from "@/store/reducers/recipes"
import user, { IUserState, UserActions } from "@/store/reducers/user"
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
import auth, { IAuthState, AuthActions, login } from "@/store/reducers/auth"
import teams, { ITeamsState, TeamsActions } from "@/store/reducers/teams"
import invites, { InviteActions, IInvitesState } from "@/store/reducers/invites"
import calendar, {
  ICalendarState,
  CalendarActions
} from "@/store/reducers/calendar"
import { loadState, saveState } from "@/store/localStorage"
import { getType } from "typesafe-actions"
import { createLogger } from "redux-logger"
import { DEBUG } from "@/settings"

const createStore = basicCreateStore as StoreCreator

interface IState {
  readonly user: IUserState
  readonly recipes: IRecipesState
  readonly invites: IInvitesState
  readonly routerReducer: RouterState
  readonly notification: INotificationState
  readonly passwordChange: IPasswordChangeState
  readonly shoppinglist: IShoppingListState
  readonly addrecipe: IAddRecipeState
  readonly auth: IAuthState
  readonly teams: ITeamsState
  readonly calendar: ICalendarState
}

export type Action =
  | UserActions
  | RecipeActions
  | InviteActions
  | NotificationsActions
  | RouterAction
  | PasswordChangeActions
  | ShoppingListActions
  | AddRecipeActions
  | AuthActions
  | TeamsActions
  | CalendarActions

export type Dispatch = ReduxDispatch<Action>

/**
 * A hack to prevent errors in testing. Jest does some weird sourcing of
 * dependencies which breaks tests. Actual dev & prod work fine.
 */
function omitUndefined(
  obj: ReducerMapObject<IState, Action>
): ReducerMapObject<IState, Action> {
  const n = {} as ReducerMapObject<IState, Action> & { [key: string]: unknown }
  for (const [key, value] of Object.entries(obj)) {
    if (value) {
      n[key] = value
    }
  }
  return n
}

const recipeApp: LoopReducer<IState, Action> = combineReducers(
  omitUndefined({
    user,
    recipes,
    invites,
    routerReducer,
    notification,
    passwordChange,
    shoppinglist,
    addrecipe,
    auth,
    teams,
    calendar
  })
)

export type RootState = IState

// reset redux to default state on logout
export function rootReducer(
  state: IState | undefined,
  action: Action
): IState | Loop<IState, Action> {
  if (state == null) {
    return recipeApp(undefined, action)
  }
  if (action.type === getType(login.success) && !action.payload) {
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

const compose: typeof reduxCompose =
  // tslint:disable-next-line no-any no-unsafe-any
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || reduxCompose

const emptyStoreEnhancers = compose(
  applyMiddleware(router),
  install()
) as StoreEnhancer<IState, Action>

// We need an empty store for the unit tests
export const emptyStore = createStore(
  rootReducer,
  {} as IState,
  emptyStoreEnhancers
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
    },
    // Note(sbdchd): we must spread the initial state for all of these as `undefined` is not
    // passed into the reducers, resulting in a bad state.
    auth: {
      ...empty.auth,
      ...saved.auth
    }
  }
}

const middleware = [router]
if (DEBUG) {
  middleware.push(createLogger({ collapsed: true }))
}

const enhancer = compose(
  install(),
  applyMiddleware(...middleware)
) as StoreEnhancer<IState, Action>

export type Store = ReduxStore<IState, Action>

// A "hydrated" store is nice for UI development
export const store: Store = createStore(rootReducer, defaultData(), enhancer)

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
      auth: {
        fromUrl: store.getState().auth.fromUrl
      }
      // tslint:disable-next-line:no-any
    } as any) as RootState)
  }, 1000)
)

export default store
