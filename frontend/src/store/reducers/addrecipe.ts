import { ActionType, createStandardAction, getType } from "typesafe-actions"

import { IIngredientBasic, IStepBasic } from "@/store/reducers/recipes"

export const setAddRecipeFormName = createStandardAction(
  "SET_ADD_RECIPE_FORM_NAME",
)<string>()
export const setAddRecipeFormAuthor = createStandardAction(
  "SET_ADD_RECIPE_FORM_AUTHOR",
)<string>()
export const setAddRecipeFormSource = createStandardAction(
  "SET_ADD_RECIPE_FORM_SOURCE",
)<string>()
export const setAddRecipeFormTime = createStandardAction(
  "SET_ADD_RECIPE_FORM_TIME",
)<IAddRecipeState["time"]>()
export const setAddRecipeFormServings = createStandardAction(
  "SET_ADD_RECIPE_FORM_SERVINGS",
)<IAddRecipeState["servings"]>()
export const addAddRecipeFormIngredient = createStandardAction(
  "ADD_ADD_RECIPE_FORM_INGREDIENT",
)<IIngredientBasic>()
export const removeAddRecipeFormIngredient = createStandardAction(
  "REMOVE_ADD_RECIPE_FORM_INGREDIENT",
)<number>()
export const addAddRecipeFormStep = createStandardAction(
  "ADD_ADD_RECIPE_FORM_STEP",
)<IStepBasic>()
export const removeAddRecipeFormStep = createStandardAction(
  "REMOVE_ADD_RECIPE_FORM_STEP",
)<number>()
export const updateAddRecipeFormIngredient = createStandardAction(
  "UPDATE_ADD_RECIPE_FORM_INGREDIENT",
)<{
  index: number
  ingredient: IIngredientBasic
}>()
export const updateAddRecipeFormStep = createStandardAction(
  "UPDATE_ADD_RECIPE_FORM_STEP",
)<{
  index: number
  step: IStepBasic
}>()
export const clearAddRecipeForm = createStandardAction(
  "CLEAR_ADD_RECIPE_FORM",
)()

export type AddRecipeActions =
  | ActionType<typeof setAddRecipeFormName>
  | ActionType<typeof setAddRecipeFormAuthor>
  | ActionType<typeof setAddRecipeFormSource>
  | ActionType<typeof setAddRecipeFormTime>
  | ActionType<typeof setAddRecipeFormServings>
  | ActionType<typeof addAddRecipeFormIngredient>
  | ActionType<typeof removeAddRecipeFormIngredient>
  | ActionType<typeof addAddRecipeFormStep>
  | ActionType<typeof removeAddRecipeFormStep>
  | ActionType<typeof updateAddRecipeFormIngredient>
  | ActionType<typeof updateAddRecipeFormStep>
  | ActionType<typeof clearAddRecipeForm>

export interface IAddRecipeState {
  readonly name: string
  readonly author: string
  readonly source: string
  readonly time: string
  readonly servings: string
  readonly ingredients: IIngredientBasic[]
  readonly steps: IStepBasic[]
}

export const initialState: IAddRecipeState = {
  name: "",
  author: "",
  source: "",
  time: "",
  servings: "",
  ingredients: [],
  steps: [],
}

const addrecipe = (
  state: IAddRecipeState = initialState,
  action: AddRecipeActions,
): IAddRecipeState => {
  switch (action.type) {
    case getType(setAddRecipeFormName):
      return { ...state, name: action.payload }
    case getType(setAddRecipeFormAuthor):
      return { ...state, author: action.payload }
    case getType(setAddRecipeFormSource):
      return { ...state, source: action.payload }
    case getType(setAddRecipeFormTime):
      return { ...state, time: action.payload }
    case getType(setAddRecipeFormServings):
      return { ...state, servings: action.payload }
    case getType(addAddRecipeFormIngredient):
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload],
      }
    case getType(removeAddRecipeFormIngredient):
      return {
        ...state,
        ingredients: state.ingredients.filter((_, i) => i !== action.payload),
      }
    case getType(updateAddRecipeFormIngredient):
      return {
        ...state,
        ingredients: state.ingredients.map((x, i) => {
          if (i === action.payload.index) {
            return action.payload.ingredient
          }
          return x
        }),
      }
    case getType(addAddRecipeFormStep):
      return {
        ...state,
        steps: [...state.steps, action.payload],
      }
    case getType(removeAddRecipeFormStep):
      return {
        ...state,
        steps: state.steps.filter((_, i) => i !== action.payload),
      }
    case getType(updateAddRecipeFormStep):
      return {
        ...state,
        steps: state.steps.map((x, i) => {
          if (i === action.payload.index) {
            return action.payload.step
          }
          return x
        }),
      }
    case getType(clearAddRecipeForm):
      return initialState
    default:
      return state
  }
}

export default addrecipe
