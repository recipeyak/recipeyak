import { rootReducer, emptyStore } from "../store"
import { setUserLoggedIn } from "./user";

describe("logout", () => {
  it("Logs out user and clears entire store", () => {
    const beforeState = {
      loggedIn: true,
      token: "testing",
      auth: {
        fromUrl: ""
      },
      routerReducer: {
        location: "test"
      }
    }

    const afterState = {
      ...emptyStore.getState(),
      routerReducer: beforeState.routerReducer
    }

    expect(rootReducer(beforeState, setUserLoggedIn(false))).toEqual(
      afterState
    )
  })
})
