import error, { initialState } from "./error"
import * as a from "../actions"

describe("error", () => {
  it("sets login error", () => {
    const notErrorState = {
      ...initialState,
      login: false
    }

    const errorState = {
      ...initialState,
      login: true
    }

    expect(error(notErrorState, a.setErrorLogin(true))).toEqual(errorState)

    expect(error(errorState, a.setErrorLogin(false))).toEqual(notErrorState)
  })

  it("sets social login error", () => {
    const notErrorState = {
      ...initialState,
      socialLogin: false
    }

    const errorState = {
      ...initialState,
      socialLogin: true
    }

    expect(error(notErrorState, a.setErrorSocialLogin(true))).toEqual(
      errorState
    )

    expect(error(errorState, a.setErrorSocialLogin(false))).toEqual(
      notErrorState
    )
  })

  it("sets recipes error", () => {
    const notErrorState = {
      ...initialState,
      recipes: false
    }

    const errorState = {
      ...initialState,
      recipes: true
    }

    expect(error(notErrorState, a.setErrorRecipes(true))).toEqual(errorState)

    expect(error(errorState, a.setErrorRecipes(false))).toEqual(notErrorState)
  })

  it("sets signup error", () => {
    const notErrorState = {
      ...initialState,
      signup: false
    }

    const errorState = {
      ...initialState,
      signup: true
    }

    expect(error(notErrorState, a.setErrorSignup(true))).toEqual(errorState)

    expect(error(errorState, a.setErrorSignup(false))).toEqual(notErrorState)
  })

  it("sets addRecipe error", () => {
    const notErrorState = {
      ...initialState,
      addRecipe: false
    }

    const errorState = {
      ...initialState,
      addRecipe: true
    }

    expect(error(notErrorState, a.setErrorAddRecipe(true))).toEqual(errorState)

    expect(error(errorState, a.setErrorAddRecipe(false))).toEqual(notErrorState)
  })

  it("sets reset error", () => {
    const notErrorState = {
      ...initialState,
      reset: false
    }

    const errorState = {
      ...initialState,
      reset: true
    }

    expect(error(notErrorState, a.setErrorReset(true))).toEqual(errorState)

    expect(error(errorState, a.setErrorReset(false))).toEqual(notErrorState)
  })

  it("sets resetConfirmation error", () => {
    const notErrorState = {
      ...initialState,
      resetConfirmation: false
    }

    const errorState = {
      ...initialState,
      resetConfirmation: true
    }

    expect(error(notErrorState, a.setErrorResetConfirmation(true))).toEqual(
      errorState
    )

    expect(error(errorState, a.setErrorResetConfirmation(false))).toEqual(
      notErrorState
    )
  })
})
