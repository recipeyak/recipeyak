import t from "../actionTypes"
import { AnyAction } from "redux"

export interface IAddRecipeState {
  readonly name: string
  readonly author: string
  readonly source: string
  readonly time: string
  readonly servings: string
  readonly ingredients: unknown[]
  readonly steps: unknown[]
}

export const initialState: IAddRecipeState = {
  name: "",
  author: "",
  source: "",
  time: "",
  servings: "",
  ingredients: [],
  steps: []
}

const addrecipe = (
  state: IAddRecipeState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case t.SET_ADD_RECIPE_FORM_NAME:
      return { ...state, name: action.val }
    case t.SET_ADD_RECIPE_FORM_AUTHOR:
      return { ...state, author: action.val }
    case t.SET_ADD_RECIPE_FORM_SOURCE:
      return { ...state, source: action.val }
    case t.SET_ADD_RECIPE_FORM_TIME:
      return { ...state, time: action.val }
    case t.SET_ADD_RECIPE_FORM_SERVINGS:
      return { ...state, servings: action.val }
    case t.ADD_ADD_RECIPE_FORM_INGREDIENT:
      return {
        ...state,
        ingredients: [...state.ingredients, action.ingredient]
      }
    case t.REMOVE_ADD_RECIPE_FORM_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((_, i) => i !== action.index)
      }
    case t.UPDATE_ADD_RECIPE_FORM_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.map((x, i) => {
          if (i === action.index) {
            return action.ingredient
          }
          return x
        })
      }
    case t.ADD_ADD_RECIPE_FORM_STEP:
      return {
        ...state,
        steps: [...state.steps, action.step]
      }
    case t.REMOVE_ADD_RECIPE_FORM_STEP:
      return {
        ...state,
        steps: state.steps.filter((_, i) => i !== action.index)
      }
    case t.UPDATE_ADD_RECIPE_FORM_STEP:
      return {
        ...state,
        steps: state.steps.map((x, i) => {
          if (i === action.index) {
            return action.step
          }
          return x
        })
      }
    case t.CLEAR_ADD_RECIPE_FORM:
      return initialState
    default:
      return state
  }
}

export default addrecipe
