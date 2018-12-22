import error, { initialState } from "./error"
import {
  setErrorLogin,
  setErrorSocialLogin,
  setErrorSignup,
  setErrorReset,
  setErrorResetConfirmation,
  setErrorAddRecipe,
  setErrorRecipes
} from "../actions"

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

    expect(error(notErrorState, setErrorLogin(true))).toEqual(errorState)

    expect(error(errorState, setErrorLogin(false))).toEqual(notErrorState)
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

    expect(error(notErrorState, setErrorSocialLogin(true))).toEqual(errorState)

    expect(error(errorState, setErrorSocialLogin(false))).toEqual(notErrorState)
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

    expect(error(notErrorState, setErrorRecipes(true))).toEqual(errorState)

    expect(error(errorState, setErrorRecipes(false))).toEqual(notErrorState)
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

    expect(error(notErrorState, setErrorSignup(true))).toEqual(errorState)

    expect(error(errorState, setErrorSignup(false))).toEqual(notErrorState)
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

    expect(error(notErrorState, setErrorAddRecipe(true))).toEqual(errorState)

    expect(error(errorState, setErrorAddRecipe(false))).toEqual(notErrorState)
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

    expect(error(notErrorState, setErrorReset(true))).toEqual(errorState)

    expect(error(errorState, setErrorReset(false))).toEqual(notErrorState)
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

    expect(error(notErrorState, setErrorResetConfirmation(true))).toEqual(
      errorState
    )

    expect(error(errorState, setErrorResetConfirmation(false))).toEqual(
      notErrorState
    )
  })
})
