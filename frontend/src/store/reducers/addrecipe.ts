import { action } from "typesafe-actions";
import { IIngredientBasic } from "../../components/AddRecipe";

const SET_ADD_RECIPE_FORM_NAME = "SET_ADD_RECIPE_FORM_NAME"
const SET_ADD_RECIPE_FORM_AUTHOR = "SET_ADD_RECIPE_FORM_AUTHOR"
const SET_ADD_RECIPE_FORM_SOURCE = "SET_ADD_RECIPE_FORM_SOURCE"
const SET_ADD_RECIPE_FORM_TIME = "SET_ADD_RECIPE_FORM_TIME"
const SET_ADD_RECIPE_FORM_SERVINGS = "SET_ADD_RECIPE_FORM_SERVINGS"
const SET_ADD_RECIPE_FORM_TEAM = "SET_ADD_RECIPE_FORM_TEAM"
const ADD_ADD_RECIPE_FORM_INGREDIENT = "ADD_ADD_RECIPE_FORM_INGREDIENT"
const REMOVE_ADD_RECIPE_FORM_INGREDIENT =
  "REMOVE_ADD_RECIPE_FORM_INGREDIENT"
const ADD_ADD_RECIPE_FORM_STEP = "ADD_ADD_RECIPE_FORM_STEP"
const REMOVE_ADD_RECIPE_FORM_STEP = "REMOVE_ADD_RECIPE_FORM_STEP"
const UPDATE_ADD_RECIPE_FORM_INGREDIENT =
  "UPDATE_ADD_RECIPE_FORM_INGREDIENT"
const UPDATE_ADD_RECIPE_FORM_STEP = "UPDATE_ADD_RECIPE_FORM_STEP"
const CLEAR_ADD_RECIPE_FORM = "CLEAR_ADD_RECIPE_FORM"


export const setAddRecipeFormName = (val: string) => action(
  SET_ADD_RECIPE_FORM_NAME, val)

export const setAddRecipeFormAuthor = (val: string) => action(
  SET_ADD_RECIPE_FORM_AUTHOR, val)

export const setAddRecipeFormSource = (val: string) => action(
  SET_ADD_RECIPE_FORM_SOURCE, val)

export const setAddRecipeFormTime = (val: string) => action(
  SET_ADD_RECIPE_FORM_TIME, val)

export const setAddRecipeFormServings = (val: string) => action(
  SET_ADD_RECIPE_FORM_SERVINGS, val)

export const setAddRecipeFormTeam = (val: string) => action(
  SET_ADD_RECIPE_FORM_TEAM, val)

export const addAddRecipeFormIngredient = (ingredient: unknown) => action(
  ADD_ADD_RECIPE_FORM_INGREDIENT, ingredient)

export const removeAddRecipeFormIngredient = (index: number) => action(
  REMOVE_ADD_RECIPE_FORM_INGREDIENT, index)

export const addAddRecipeFormStep = (step: { text?: string }) => action(
  ADD_ADD_RECIPE_FORM_STEP, step)

export const removeAddRecipeFormStep = (index: number) => action(
  REMOVE_ADD_RECIPE_FORM_STEP, index )

export const updateAddRecipeFormIngredient = (
  index: number,
  ingredient: IIngredientBasic
) => action(
  UPDATE_ADD_RECIPE_FORM_INGREDIENT, {
  index,
  ingredient
})

export const updateAddRecipeFormStep = (index: number, step: unknown) => action(
  UPDATE_ADD_RECIPE_FORM_STEP, {
  index,
  step
})

export const clearAddRecipeForm = () => action(CLEAR_ADD_RECIPE_FORM)



type AddRecipeActions =
  | ReturnType<typeof setAddRecipeFormName >
  | ReturnType<typeof setAddRecipeFormAuthor >
  | ReturnType<typeof setAddRecipeFormSource >
  | ReturnType<typeof setAddRecipeFormTime >
  | ReturnType<typeof setAddRecipeFormServings >
  | ReturnType<typeof setAddRecipeFormTeam >
  | ReturnType<typeof addAddRecipeFormIngredient >
  | ReturnType<typeof removeAddRecipeFormIngredient >
  | ReturnType<typeof addAddRecipeFormStep >
  | ReturnType<typeof removeAddRecipeFormStep >
  | ReturnType<typeof updateAddRecipeFormIngredient >
  | ReturnType<typeof updateAddRecipeFormStep >
  | ReturnType<typeof clearAddRecipeForm >


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
  action: AddRecipeActions
): IAddRecipeState => {
  switch (action.type) {
    case SET_ADD_RECIPE_FORM_NAME:
      return { ...state, name: action.payload }
    case SET_ADD_RECIPE_FORM_AUTHOR:
      return { ...state, author: action.payload }
    case SET_ADD_RECIPE_FORM_SOURCE:
      return { ...state, source: action.payload }
    case SET_ADD_RECIPE_FORM_TIME:
      return { ...state, time: action.payload }
    case SET_ADD_RECIPE_FORM_SERVINGS:
      return { ...state, servings: action.payload }
    case ADD_ADD_RECIPE_FORM_INGREDIENT:
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload]
      }
    case REMOVE_ADD_RECIPE_FORM_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((_, i) => i !== action.payload)
      }
    case UPDATE_ADD_RECIPE_FORM_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.map((x, i) => {
          if (i === action.payload.index) {
            return action.payload.ingredient
          }
          return x
        })
      }
    case ADD_ADD_RECIPE_FORM_STEP:
      return {
        ...state,
        steps: [...state.steps, action.payload]
      }
    case REMOVE_ADD_RECIPE_FORM_STEP:
      return {
        ...state,
        steps: state.steps.filter((_, i) => i !== action.payload)
      }
    case UPDATE_ADD_RECIPE_FORM_STEP:
      return {
        ...state,
        steps: state.steps.map((x, i) => {
          if (i === action.payload.index) {
            return action.payload.step
          }
          return x
        })
      }
    case CLEAR_ADD_RECIPE_FORM:
      return initialState
    default:
      return state
  }
}

export default addrecipe
