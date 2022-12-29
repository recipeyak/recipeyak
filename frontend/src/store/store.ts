import { throttle } from "lodash-es"
import {
  combineReducers,
  createStore,
  // eslint-disable-next-line no-restricted-imports
  Dispatch as ReduxDispatch,
  Store as ReduxStore,
} from "redux"
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

export interface IState {
  readonly user: IUserState
  readonly shoppinglist: IShoppingListState
}

export type Action = UserActions | ShoppingListActions | { type: "@@RESET" }
export type Dispatch = ReduxDispatch<Action>

const recipeApp = combineReducers({
  user,
  shoppinglist,
})

// reset redux to default state on logout
export function rootReducer(state: IState | undefined, action: Action): IState {
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

// We need an empty store for the unit tests & hydrating from localstorage
const emptyStore: Store = createStore(rootReducer, undefined)

export type Store = ReduxStore<IState, Action>

// A "hydrated" store is nice for UI development
export const store: Store = createStore(rootReducer, defaultData())

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
