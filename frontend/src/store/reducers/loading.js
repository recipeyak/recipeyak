import {
  SET_LOADING_LOGIN,
  SET_LOADING_SIGNUP,
  SET_LOADING_RESET,
  SET_LOADING_RESET_CONFIRMATION,
  SET_LOADING_RECIPES,
  SET_LOADING_ADD_RECIPE
} from "../actionTypes";

const loading = (
  state = {
    login: false,
    signup: false,
    reset: false,
    resetConfirmation: false,
    recipes: false,
    addRecipe: false
  },
  action
) => {
  switch (action.type) {
    case SET_LOADING_LOGIN:
      return { ...state, login: action.val };
    case SET_LOADING_SIGNUP:
      return { ...state, signup: action.val };
    case SET_LOADING_RESET:
      return { ...state, reset: action.val };
    case SET_LOADING_RESET_CONFIRMATION:
      return { ...state, resetConfirmation: action.val };
    case SET_LOADING_RECIPES:
      return { ...state, recipes: action.val };
    case SET_LOADING_ADD_RECIPE:
      return { ...state, addRecipe: action.val };
    default:
      return state;
  }
};

export default loading;
