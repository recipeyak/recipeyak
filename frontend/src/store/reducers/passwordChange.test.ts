import passwordChange, { initialState } from "./passwordChange"

import { setLoadingPasswordUpdate, setErrorPasswordUpdate } from "../actions"

describe("passwordChange", () => {
  it("sets the loading state of the updating password", () => {
    const beforeState = initialState

    const afterState = {
      ...initialState,
      loadingPasswordUpdate: true
    }

    expect(passwordChange(beforeState, setLoadingPasswordUpdate(true))).toEqual(
      afterState
    )

    const anotherAfterState = {
      ...initialState,
      loadingPasswordUpdate: false
    }

    expect(
      passwordChange(beforeState, setLoadingPasswordUpdate(false))
    ).toEqual(anotherAfterState)
  })

  it("sets the error state of the updating password", () => {
    const beforeState = initialState

    const error = {
      new_password2: ["The two password fields didn't match."]
    }

    const afterState = {
      ...initialState,
      errorPasswordUpdate: error
    }
    expect(passwordChange(beforeState, setErrorPasswordUpdate(error))).toEqual(
      afterState
    )
  })
})
