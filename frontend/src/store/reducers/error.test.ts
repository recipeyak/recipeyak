import error, { initialState } from "@/store/reducers/error"
import * as a from "@/store/reducers/error"

describe("error", () => {
  it("sets login error", () => {
    const notErrorState = {
      ...initialState,
      login: {}
    }

    const loginError = {
      email: ["foo"]
    }

    const errorState = {
      ...initialState,
      login: loginError
    }

    expect(error(notErrorState, a.setErrorLogin(loginError))).toEqual(
      errorState
    )

    expect(error(errorState, a.setErrorLogin({}))).toEqual(notErrorState)
  })

  it("sets social login error", () => {
    const notErrorState = {
      ...initialState,
      socialLogin: {}
    }

    const socialError = {
      emailSocial: ["foo"]
    }
    const errorState = {
      ...initialState,
      socialLogin: socialError
    }

    expect(error(notErrorState, a.setErrorSocialLogin(socialError))).toEqual(
      errorState
    )

    expect(error(errorState, a.setErrorSocialLogin({}))).toEqual(notErrorState)
  })

  it("sets signup error", () => {
    const notErrorState = {
      ...initialState,
      signup: {}
    }

    const signupErrors = {
      password1: ["bad password"]
    }

    const errorState = {
      ...initialState,
      signup: signupErrors
    }

    expect(error(notErrorState, a.setErrorSignup(signupErrors))).toEqual(
      errorState
    )

    expect(error(errorState, a.setErrorSignup({}))).toEqual(notErrorState)
  })

  it("sets addRecipe error", () => {
    const notErrorState = {
      ...initialState,
      addRecipe: {}
    }

    const errorState = {
      ...initialState,
      addRecipe: {
        errorWithName: true
      }
    }

    expect(
      error(notErrorState, a.setErrorAddRecipe({ errorWithName: true }))
    ).toEqual(errorState)

    expect(error(errorState, a.setErrorAddRecipe({}))).toEqual(notErrorState)
  })

  it("sets reset error", () => {
    const notErrorState = {
      ...initialState,
      reset: {}
    }

    const resetError = {
      email: ["foo"]
    }

    const errorState = {
      ...initialState,
      reset: resetError
    }

    expect(error(notErrorState, a.setErrorReset(resetError))).toEqual(
      errorState
    )

    expect(error(errorState, a.setErrorReset({}))).toEqual(notErrorState)
  })

  it("sets resetConfirmation error", () => {
    const notErrorState = {
      ...initialState,
      resetConfirmation: {}
    }

    const resetConfirmError = {
      newPassword1: ["foo"]
    }
    const errorState = {
      ...initialState,
      resetConfirmation: resetConfirmError
    }

    expect(
      error(notErrorState, a.setErrorResetConfirmation(resetConfirmError))
    ).toEqual(errorState)

    expect(error(errorState, a.setErrorResetConfirmation({}))).toEqual(
      notErrorState
    )
  })
})
