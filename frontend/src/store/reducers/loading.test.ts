import loading, { initialState } from "@/store/reducers/loading"
import * as a from "@/store/reducers/loading"

describe("loading", () => {
  it("sets loading login", () => {
    const notLoadingState = {
      ...initialState,
      login: false
    }

    const loadingState = {
      ...initialState,
      login: true
    }

    expect(loading(notLoadingState, a.setLoadingLogin(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, a.setLoadingLogin(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading signup", () => {
    const notLoadingState = {
      ...initialState,
      signup: false
    }

    const loadingState = {
      ...initialState,
      signup: true
    }

    expect(loading(notLoadingState, a.setLoadingSignup(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, a.setLoadingSignup(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading reset", () => {
    const notLoadingState = {
      ...initialState,
      reset: false
    }

    const loadingState = {
      ...initialState,
      reset: true
    }

    expect(loading(notLoadingState, a.setLoadingReset(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, a.setLoadingReset(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading reset confirmation", () => {
    const notLoadingState = {
      ...initialState,
      resetConfirmation: false
    }

    const loadingState = {
      ...initialState,
      resetConfirmation: true
    }

    expect(
      loading(notLoadingState, a.setLoadingResetConfirmation(true))
    ).toEqual(loadingState)

    expect(loading(loadingState, a.setLoadingResetConfirmation(false))).toEqual(
      notLoadingState
    )
  })
})
