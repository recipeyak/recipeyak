import { rootReducer, IState, createEmptyStore } from "@/store/store"
import { setUserLoggedIn } from "@/store/reducers/user"
import { initialState } from "@/store/reducers/auth"
import { getModel } from "redux-loop"

describe("logout", () => {
  it("Logs out user and clears entire store", () => {
    const emptyStore = createEmptyStore()
    const beforeState: IState = {
      ...emptyStore.getState(),
      user: {
        ...emptyStore.getState().user,
        loggedIn: true,
      },
      auth: initialState,
      router: {
        location: {
          state: "",
          pathname: "",
          search: "",
          hash: "",
        },
      },
    }

    const afterState = {
      ...emptyStore.getState(),
      router: beforeState.router,
    }

    expect(getModel(rootReducer(beforeState, setUserLoggedIn(false)))).toEqual(
      afterState,
    )
  })
})
