import { expect, test, it, describe } from "vitest"
import passwordChange, {
  initialState,
  passwordUpdate,
} from "@/store/reducers/passwordChange"

describe("passwordChange", () => {
  it("sets the loading state of the updating password", () => {
    const beforeState = initialState

    const afterState = {
      ...initialState,
      loadingPasswordUpdate: true,
    }

    expect(passwordChange(beforeState, passwordUpdate.request())).toEqual(
      afterState,
    )

    const anotherAfterState = {
      ...initialState,
      loadingPasswordUpdate: false,
    }

    expect(passwordChange(beforeState, passwordUpdate.success())).toEqual(
      anotherAfterState,
    )
  })

  it("sets the error state of the updating password", () => {
    const beforeState = initialState

    const error = {
      newPassword: ["The two password fields didn't match."],
    }

    const afterState = {
      ...initialState,
      errorPasswordUpdate: error,
    }
    expect(passwordChange(beforeState, passwordUpdate.failure(error))).toEqual(
      afterState,
    )
  })
})
