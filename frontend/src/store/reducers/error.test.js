import error from "./error.js";
import {
  setErrorLogin,
  setErrorSocialLogin,
  setErrorSignup,
  setErrorReset,
  setErrorResetConfirmation,
  setErrorAddRecipe,
  setErrorRecipes
} from "../actions.js";

describe("error", () => {
  it("sets login error", () => {
    const notErrorState = {
      login: false
    };

    const errorState = {
      login: true
    };

    expect(error(notErrorState, setErrorLogin(true))).toEqual(errorState);

    expect(error(errorState, setErrorLogin(false))).toEqual(notErrorState);
  });

  it("sets social login error", () => {
    const notErrorState = {
      socialLogin: false
    };

    const errorState = {
      socialLogin: true
    };

    expect(error(notErrorState, setErrorSocialLogin(true))).toEqual(errorState);

    expect(error(errorState, setErrorSocialLogin(false))).toEqual(
      notErrorState
    );
  });

  it("sets recipes error", () => {
    const notErrorState = {
      recipes: false
    };

    const errorState = {
      recipes: true
    };

    expect(error(notErrorState, setErrorRecipes(true))).toEqual(errorState);

    expect(error(errorState, setErrorRecipes(false))).toEqual(notErrorState);
  });

  it("sets signup error", () => {
    const notErrorState = {
      signup: false
    };

    const errorState = {
      signup: true
    };

    expect(error(notErrorState, setErrorSignup(true))).toEqual(errorState);

    expect(error(errorState, setErrorSignup(false))).toEqual(notErrorState);
  });

  it("sets addRecipe error", () => {
    const notErrorState = {
      addRecipe: false
    };

    const errorState = {
      addRecipe: true
    };

    expect(error(notErrorState, setErrorAddRecipe(true))).toEqual(errorState);

    expect(error(errorState, setErrorAddRecipe(false))).toEqual(notErrorState);
  });

  it("sets reset error", () => {
    const notErrorState = {
      reset: false
    };

    const errorState = {
      reset: true
    };

    expect(error(notErrorState, setErrorReset(true))).toEqual(errorState);

    expect(error(errorState, setErrorReset(false))).toEqual(notErrorState);
  });

  it("sets resetConfirmation error", () => {
    const notErrorState = {
      resetConfirmation: false
    };

    const errorState = {
      resetConfirmation: true
    };

    expect(error(notErrorState, setErrorResetConfirmation(true))).toEqual(
      errorState
    );

    expect(error(errorState, setErrorResetConfirmation(false))).toEqual(
      notErrorState
    );
  });
});
