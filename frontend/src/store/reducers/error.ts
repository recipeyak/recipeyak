// TODO(sbdchd): this reducer shouldn't even exist
import { action } from "typesafe-actions";


const SET_ERROR_LOGIN = "SET_ERROR_LOGIN"

const SET_ERROR_SOCIAL_LOGIN = "SET_ERROR_SOCIAL_LOGIN"

const SET_ERROR_SIGNUP = "SET_ERROR_SIGNUP"

const SET_ERROR_RECIPES = "SET_ERROR_RECIPES"
const SET_ERROR_RESET = "SET_ERROR_RESET"

const SET_ERROR_RESET_CONFIRMATION = "SET_ERROR_RESET_CONFIRMATION"

const SET_ERROR_ADD_RECIPE = "SET_ERROR_ADD_RECIPE"



export const setErrorLogin = (val: unknown) => action( SET_ERROR_LOGIN, val)


export const setErrorSocialLogin = (val: unknown) => action(SET_ERROR_SOCIAL_LOGIN, val)



export const setErrorSignup = (val: unknown) => action( SET_ERROR_SIGNUP, val)


export const setErrorRecipes = (val: boolean) => action(SET_ERROR_RECIPES, val)



export const setErrorReset = (val: unknown) => action(
  SET_ERROR_RESET,
  val
)


export const setErrorResetConfirmation = (val: unknown) => action(SET_ERROR_RESET_CONFIRMATION, val)



export const setErrorAddRecipe = (val: IAddRecipeError) => action(SET_ERROR_ADD_RECIPE, val)

type ErrorActions =
  | ReturnType<typeof setErrorLogin>
  | ReturnType<typeof setErrorSocialLogin>
  | ReturnType<typeof setErrorSignup>
  | ReturnType<typeof setErrorRecipes>
  | ReturnType<typeof setErrorReset>
  | ReturnType<typeof setErrorResetConfirmation>
  | ReturnType<typeof setErrorAddRecipe>


interface IAddRecipeError {
        readonly errorWithName?: boolean
        readonly errorWithIngredients?: boolean
        readonly errorWithSteps?: boolean
      }

export interface IErrorState {
  readonly login: unknown
  readonly socialLogin: unknown
  readonly signup: unknown
  readonly reset: unknown
  readonly resetConfirmation: unknown
  readonly addRecipe: IAddRecipeError
  readonly recipes: boolean
}

export const initialState: IErrorState = {
  login: {},
  socialLogin: {},
  signup: {},
  reset: {},
  resetConfirmation: {},
  addRecipe: {
    errorWithName: false,
    errorWithIngredients: false,
    errorWithSteps: false
  },
  recipes: false
}

const error = (state: IErrorState = initialState, action: ErrorActions): IErrorState => {
  switch (action.type) {
    case SET_ERROR_LOGIN:
      return { ...state, login: action.payload }
    case SET_ERROR_SOCIAL_LOGIN:
      return { ...state, socialLogin: action.payload }
    case SET_ERROR_SIGNUP:
      return { ...state, signup: action.payload }
    case SET_ERROR_RECIPES:
      return { ...state, recipes: action.payload }
    case SET_ERROR_RESET:
      return { ...state, reset: action.payload }
    case SET_ERROR_RESET_CONFIRMATION:
      return { ...state, resetConfirmation: action.payload }
    case SET_ERROR_ADD_RECIPE:
      return { ...state, addRecipe: action.payload }
    default:
      return state
  }
}

export default error
