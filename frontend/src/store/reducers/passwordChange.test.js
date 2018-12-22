import passwordChange from "./passwordChange.js"

import { setLoadingPasswordUpdate, setErrorPasswordUpdate } from "../actions"

describe("passwordChange", () => {
  it("sets the loading state of the updating password", () => {
    const beforeState = {}

    const afterState = {
      loadingPasswordUpdate: true
    }

    expect(passwordChange(beforeState, setLoadingPasswordUpdate(true))).toEqual(
      afterState
    )

    const anotherAfterState = {
      loadingPasswordUpdate: false
    }

    expect(
      passwordChange(beforeState, setLoadingPasswordUpdate(false))
    ).toEqual(anotherAfterState)
  })

  it("sets the error state of the updating password", () => {
    const beforeState = {}

    const error = {
      new_password2: ["The two password fields didn't match."]
    }

    const afterState = {
      errorPasswordUpdate: error
    }
    expect(passwordChange(beforeState, setErrorPasswordUpdate(error))).toEqual(
      afterState
    )
  })
})
