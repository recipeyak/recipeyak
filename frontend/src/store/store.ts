import { createBrowserHistory as createHistory } from "history"
import { pickBy, throttle } from "lodash-es"
import {
  compose as reduxCompose,
  createStore as basicCreateStore,
  // eslint-disable-next-line no-restricted-imports
  Dispatch as ReduxDispatch,
  Store as ReduxStore,
  StoreEnhancer,
} from "redux"
import {
  combineReducers,
  install,
  Loop,
  LoopReducer,
  ReducerMapObject,
  StoreCreator,
} from "redux-loop"
import { getType } from "typesafe-actions"

import { loadState, saveState } from "@/store/localStorage"
import shoppinglist, {
  IShoppingListState,
  ShoppingListActions,
} from "@/store/reducers/shoppinglist"
import user, {
  cacheUserInfo,
  IUserState,
  UserActions,
} from "@/store/reducers/user"

const createStore: StoreCreator = basicCreateStore

export interface IState {
  readonly user: IUserState
  readonly shoppinglist: IShoppingListState
}

export type Action = UserActions | ShoppingListActions | { type: "@@RESET" }
export type Dispatch = ReduxDispatch<Action>

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
    shoppinglist,
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
  if (action.type === getType(cacheUserInfo) && !action.payload) {
    return {
      ...recipeApp(undefined, action),
    }
  }
  return recipeApp(state, action)
}

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
  }
}

export const enhancer: StoreEnhancer<IState, Action> = compose(install())

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
        // TODO: this could probably be avoided by using a preload of data

        // We assume this is true and if the session expires we have axios interceptors
        // to set this to false. In that _rare_ case, there will be a slight flash, but
        // this is acceptable for us for the added performance
        loggedIn: store.getState().user.loggedIn,
        scheduleTeamID: store.getState().user.scheduleTeamID,
      },
    } as unknown as IState)
  }, 1000),
)

export default store
