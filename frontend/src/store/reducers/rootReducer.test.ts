import { rootReducer, emptyStore, RootState } from "@/store/store"
import { setUserLoggedIn } from "@/store/reducers/user"
import { initialState } from "@/store/reducers/auth";

describe("logout", () => {
  it("Logs out user and clears entire store", () => {
    const beforeState: RootState = {
      ...emptyStore.getState(),
      user: {
        ...emptyStore.getState().user,
        loggedIn: true
      },
      auth: initialState,
      routerReducer: {
        location: {
          state: "",
          pathname: "",
          search: "",
          hash: ""
        }
      }
    }

    const afterState = {
      ...emptyStore.getState(),
      routerReducer: beforeState.routerReducer
    }

    expect(rootReducer(beforeState, setUserLoggedIn(false))).toEqual(afterState)
  })
})
