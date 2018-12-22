import loading, { initialState } from "./loading"
import {
  setLoadingLogin,
  setLoadingSignup,
  setLoadingReset,
  setLoadingResetConfirmation,
  setLoadingRecipes,
  setLoadingAddRecipe
} from "../actions"

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

    expect(loading(notLoadingState, setLoadingLogin(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingLogin(false))).toEqual(
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

    expect(loading(notLoadingState, setLoadingSignup(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingSignup(false))).toEqual(
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

    expect(loading(notLoadingState, setLoadingReset(true))).toEqual(
      loadingState
    )

    expect(loading(loadingState, setLoadingReset(false))).toEqual(
      notLoadingState
    )
  })

  it("sets loading recipes", () => {
    const notLoadingState = {
      ...initialState,
      recipes: false
    }

    const loadingState = {
      ...initialState,
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
      ...initialState,
      addRecipe: false
    }

    const loadingState = {
      ...initialState,
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
      ...initialState,
      resetConfirmation: false
    }

    const loadingState = {
      ...initialState,
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
