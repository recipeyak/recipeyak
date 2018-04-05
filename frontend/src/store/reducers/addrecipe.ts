import {
  SET_ADD_RECIPE_FORM_NAME,
  SET_ADD_RECIPE_FORM_AUTHOR,
  SET_ADD_RECIPE_FORM_SOURCE,
  SET_ADD_RECIPE_FORM_TIME,
  SET_ADD_RECIPE_FORM_SERVINGS,
  SET_ADD_RECIPE_FORM_TEAM,
  ADD_ADD_RECIPE_FORM_INGREDIENT,
  REMOVE_ADD_RECIPE_FORM_INGREDIENT,
  UPDATE_ADD_RECIPE_FORM_INGREDIENT,
  ADD_ADD_RECIPE_FORM_STEP,
  REMOVE_ADD_RECIPE_FORM_STEP,
  UPDATE_ADD_RECIPE_FORM_STEP,
  CLEAR_ADD_RECIPE_FORM
} from '../actionTypes'

import {
  Team
} from './teams'

import {
  Ingredient,
  Step,
} from './recipes'

interface SetAddRecipeFormName {
  type: typeof SET_ADD_RECIPE_FORM_NAME
  val: string
}

interface SetAddRecipeFormAuthor {
  type: typeof SET_ADD_RECIPE_FORM_AUTHOR
  val: string
}

interface SetAddRecipeFormSource {
  type: typeof SET_ADD_RECIPE_FORM_SOURCE
  val: string
}

interface SetAddRecipeFormTime {
  type: typeof SET_ADD_RECIPE_FORM_TIME
  val: string
}

interface SetAddRecipeFormServings {
  type: typeof SET_ADD_RECIPE_FORM_SERVINGS
  val: string
}

interface SetAddRecipeFormTeam {
  type: typeof SET_ADD_RECIPE_FORM_TEAM
  val: string
}

interface AddAddRecipeFormIngredient {
  type: typeof ADD_ADD_RECIPE_FORM_INGREDIENT
  ingredient: Ingredient
}

interface RemoveAddRecipeFormIngredient {
  type: typeof REMOVE_ADD_RECIPE_FORM_INGREDIENT
  index: number
}

interface UpdateAddRecipeFormIngredient {
  type: typeof UPDATE_ADD_RECIPE_FORM_INGREDIENT
  index: number
  ingredient: Ingredient
}

interface AddAddRecipeFormStep {
  type: typeof ADD_ADD_RECIPE_FORM_STEP
  step: Step
}

interface RemoveAddRecipeFormStep {
  type: typeof REMOVE_ADD_RECIPE_FORM_STEP
  index: number
}

interface UpdateAddRecipeFormStep {
  type: typeof UPDATE_ADD_RECIPE_FORM_STEP
  index: number
  step: Step
}

interface ClearAddRecipeForm {
  type: typeof CLEAR_ADD_RECIPE_FORM
}

type AddRecipeActions = SetAddRecipeFormName
  | SetAddRecipeFormAuthor
  | SetAddRecipeFormSource
  | SetAddRecipeFormTime
  | SetAddRecipeFormServings
  | SetAddRecipeFormTeam
  | AddAddRecipeFormIngredient
  | RemoveAddRecipeFormIngredient
  | UpdateAddRecipeFormIngredient
  | AddAddRecipeFormStep
  | RemoveAddRecipeFormStep
  | UpdateAddRecipeFormStep
  | ClearAddRecipeForm

export const initialState = {
  name: '',
  author: '',
  source: '',
  time: '',
  servings: '',
  ingredients: [] as Ingredient[],
  steps: [] as Step[],
  team: null as Team,
}

export type AddRecipeState = typeof initialState

const cart = (
  state = initialState,
  action: AddRecipeActions
) => {
  switch (action.type) {
  case SET_ADD_RECIPE_FORM_NAME:
    return { ...state, name: action.val }
  case SET_ADD_RECIPE_FORM_AUTHOR:
    return { ...state, author: action.val }
  case SET_ADD_RECIPE_FORM_SOURCE:
    return { ...state, source: action.val }
  case SET_ADD_RECIPE_FORM_TIME:
    return { ...state, time: action.val }
  case SET_ADD_RECIPE_FORM_SERVINGS:
    return { ...state, servings: action.val }
  case SET_ADD_RECIPE_FORM_TEAM:
    return { ...state, team: action.val }
  case ADD_ADD_RECIPE_FORM_INGREDIENT:
    return {
      ...state,
      ingredients: [
        ...state.ingredients,
        action.ingredient
      ]
    }
  case REMOVE_ADD_RECIPE_FORM_INGREDIENT:
    return {
      ...state,
      ingredients: state.ingredients.filter((_, i) => i !== action.index)
    }
  case UPDATE_ADD_RECIPE_FORM_INGREDIENT:
    return {
      ...state,
      ingredients: state.ingredients.map((x, i) => {
        if (i === action.index) {
          return action.ingredient
        }
        return x
      })
    }
  case ADD_ADD_RECIPE_FORM_STEP:
    return {
      ...state,
      steps: [
        ...state.steps,
        action.step
      ]
    }
  case REMOVE_ADD_RECIPE_FORM_STEP:
    return {
      ...state,
      steps: state.steps.filter((_, i) => i !== action.index)
    }
  case UPDATE_ADD_RECIPE_FORM_STEP:
    return {
      ...state,
      steps: state.steps.map((x, i) => {
        if (i === action.index) {
          return action.step
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

export default cart
