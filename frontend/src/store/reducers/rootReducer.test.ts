import { rootReducer, emptyStore, IState } from "@/store/store"
import { setUserLoggedIn } from "@/store/reducers/user"
import { initialState } from "@/store/reducers/auth"
import { getModel } from "redux-loop"

describe("logout", () => {
  it("Logs out user and clears entire store", () => {
    const beforeState: IState = {
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

    expect(getModel(rootReducer(beforeState, setUserLoggedIn(false)))).toEqual(
      afterState
    )
  })
})
