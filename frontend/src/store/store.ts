import type { RouterAction, RouterState } from "connected-react-router"
import { connectRouter, routerMiddleware } from "connected-react-router"
import { createBrowserHistory as createHistory } from "history"
import { pickBy, throttle } from "lodash-es"
import type { Store as ReduxStore, StoreEnhancer } from "redux"
import {
  applyMiddleware,
  compose as reduxCompose,
  createStore as basicCreateStore,
} from "redux"
import type {
  Loop,
  LoopReducer,
  ReducerMapObject,
  StoreCreator,
} from "redux-loop"
import { combineReducers, install } from "redux-loop"
import { getType } from "typesafe-actions"

import { second } from "@/date"
import { loadState, saveState } from "@/store/localStorage"
import type {
  AddRecipeActions,
  IAddRecipeState,
} from "@/store/reducers/addrecipe"
import addrecipe from "@/store/reducers/addrecipe"
import type { AuthActions, IAuthState } from "@/store/reducers/auth"
import auth, { login } from "@/store/reducers/auth"
import type { CalendarActions, ICalendarState } from "@/store/reducers/calendar"
import calendar from "@/store/reducers/calendar"
import type { IInvitesState, InviteActions } from "@/store/reducers/invites"
import invites from "@/store/reducers/invites"
import type {
  INotificationState,
  NotificationsActions,
} from "@/store/reducers/notification"
import notification from "@/store/reducers/notification"
import type {
  IPasswordChangeState,
  PasswordChangeActions,
} from "@/store/reducers/passwordChange"
import passwordChange from "@/store/reducers/passwordChange"
import type { IRecipesState, RecipeActions } from "@/store/reducers/recipes"
import recipes from "@/store/reducers/recipes"
import type {
  IShoppingListState,
  ShoppingListActions,
} from "@/store/reducers/shoppinglist"
import shoppinglist from "@/store/reducers/shoppinglist"
import type { ITeamsState, TeamsActions } from "@/store/reducers/teams"
import teams from "@/store/reducers/teams"
import type { IUserState, UserActions } from "@/store/reducers/user"
import user from "@/store/reducers/user"

const createStore: StoreCreator = basicCreateStore

export interface IState {
  readonly user: IUserState
  readonly recipes: IRecipesState
  readonly invites: IInvitesState
  readonly router: Omit<RouterState, "action">
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
  | { type: "@@RESET" }

/**
 * A hack to prevent errors in testing. Jest does some weird sourcing of
 * dependencies which breaks tests. Actual dev & prod work fine.
 * The sourcing issue is from a cylical dependency. See the usage of `store` in
 * `@/http`
 */
type ReducerMapObj = ReducerMapObject<IState, Action>
function omitUndefined(obj: ReducerMapObj): ReducerMapObj {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return pickBy(obj, (x) => x != null) as ReducerMapObj
}
export const history = createHistory()

const recipeApp: LoopReducer<IState, Action> = combineReducers(
  omitUndefined({
    user,
    recipes,
    invites,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    router: connectRouter(history) as unknown as LoopReducer<
      Pick<RouterState, "location">,
      Action
    >,
    notification,
    passwordChange,
    shoppinglist,
    addrecipe,
    auth,
    teams,
    calendar,
  }),
)

// reset redux to default state on logout
export function rootReducer(
  state: IState | undefined,
  action: Action,
): IState | Loop<IState, Action> {
  if (state == null || action.type === "@@RESET") {
    return recipeApp(undefined, action)
  }
  if (action.type === getType(login.success) && !action.payload) {
    return {
      ...recipeApp(undefined, action),
      // We need to save this auth state (fromUrl) through logout
      // so we can redirect users to where they were attempting to
      // visit before being asked for authentication
      auth: state.auth,
      router: state.router,
    }
  }
  return recipeApp(state, action)
}

const router = routerMiddleware(history)

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const compose: typeof reduxCompose =
  /* eslint-disable @typescript-eslint/consistent-type-assertions */

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || reduxCompose
/* eslint-enable @typescript-eslint/consistent-type-assertions */

// NOTE(sbdchd): this is hacky, we should validate the local storage state before using it
const defaultData = (): IState => {
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
      ...saved.user,
    },
    // Note(sbdchd): we must spread the initial state for all of these as `undefined` is not
    // passed into the reducers, resulting in a bad state.
    auth: {
      ...empty.auth,
      ...saved.auth,
    },
  }
}

export const enhancer: StoreEnhancer<IState, Action> = compose(
  install(),
  applyMiddleware(router),
)

// We need an empty store for the unit tests & hydrating from localstorage
const emptyStore: Store = createStore(rootReducer, undefined, enhancer)

export function createEmptyStore(state?: IState) {
  return createStore(rootReducer, state, enhancer)
}

export type Store = ReduxStore<IState, Action>

// A "hydrated" store is nice for UI development
export const store: Store = createStore(rootReducer, defaultData(), enhancer)

store.subscribe(
  throttle(() => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    saveState({
      user: {
        // We assume this is true and if the session expires we have axios interceptors
        // to set this to false. In that _rare_ case, there will be a slight flash, but
        // this is acceptable for us for the added performance
        loggedIn: store.getState().user.loggedIn,
        darkMode: store.getState().user.darkMode,
        recipeTeamID: store.getState().user.recipeTeamID,
        scheduleTeamID: store.getState().user.scheduleTeamID,
      },
      addrecipe: store.getState().addrecipe,
      auth: {
        fromUrl: store.getState().auth.fromUrl,
      },
    } as unknown as IState)
  }, second),
)

export default store
