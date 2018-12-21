import loading from "./loading.js"
import {
  setLoadingLogin,
  setLoadingSignup,
  setLoadingReset,
  setLoadingResetConfirmation,
  setLoadingRecipes,
  setLoadingAddRecipe
} from "../actions.js"

describe("loading", () => {
  it("sets loading login", () => {
    const notLoadingState = {
      login: false
    }

    const loadingState = {
      login: true
    }

    expect(loading(notLoadingState, setLoadingLogin(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingLogin(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading signup", () => {
    const notLoadingState = {
      signup: false
    }

    const loadingState = {
      signup: true
    }

    expect(loading(notLoadingState, setLoadingSignup(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingSignup(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading reset", () => {
    const notLoadingState = {
      reset: false
    }

    const loadingState = {
      reset: true
    }

    expect(loading(notLoadingState, setLoadingReset(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingReset(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading recipes", () => {
    const notLoadingState = {
      recipes: false
    }

    const loadingState = {
      recipes: true
    }

    expect(loading(notLoadingState, setLoadingRecipes(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingRecipes(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading addRecipe", () => {
    const notLoadingState = {
      addRecipe: false
    }

    const loadingState = {
      addRecipe: true
    }

    expect(loading(notLoadingState, setLoadingAddRecipe(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingAddRecipe(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading reset confirmation", () => {
    const notLoadingState = {
      resetConfirmation: false
    }

    const loadingState = {
      resetConfirmation: true
    }

    expect(loading(notLoadingState, setLoadingResetConfirmation(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingResetConfirmation(false))).toEqual(
      notLoadingState
    )
  })
})
