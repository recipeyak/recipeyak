import * as t from "../actionTypes"
import { AnyAction } from "redux"
import { ITeam } from "./teams"

export interface IIngredient {
  readonly id: number
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly position: number
  readonly optional: boolean
  readonly updating?: boolean
  readonly removing?: boolean
}

export interface IStep {
  readonly id: number
  readonly text: string
  readonly position: number
  readonly updating?: boolean
  readonly removing?: boolean
}

type IRecipeOwner =
  | {
      type: "team"
      id: number
      name: string
    }
  | {
      type: "user"
      id: number
    }

export interface IRecipe {
  readonly id: number
  readonly name: string
  readonly author: string
  readonly source: string
  readonly time: string
  readonly servings: string
  readonly steps: IStep[]
  readonly edits: unknown[]
  readonly modified: string
  readonly last_scheduled: string
  readonly team: ITeam["id"]
  readonly owner: IRecipeOwner
  readonly ingredients: IIngredient[]
  readonly loading?: boolean
  readonly deleting?: boolean
  readonly addingStepToRecipe?: boolean
  readonly addingIngredient?: boolean

  readonly scheduling?: boolean
  readonly updating?: boolean
  readonly error404?: boolean
}

export interface IRecipesState {
  readonly [key: number]: IRecipe
}

export const initialState: IRecipesState = {}

export const recipes = (
  state: IRecipesState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case t.ADD_RECIPE:
      return { ...state, [action.recipe.id]: action.recipe }
    case t.DELETE_RECIPE:
      return { ...state, [action.id]: undefined }
    case t.ADD_STEP_TO_RECIPE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          steps: [...state[action.id].steps, action.step]
        }
      }
    case t.SET_LOADING_ADD_STEP_TO_RECIPE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          addingStepToRecipe: action.val
        }
      }
    case t.SET_RECIPE_404:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          error404: action.val
        }
      }
    case t.ADD_INGREDIENT_TO_RECIPE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ingredients: [...state[action.id].ingredients, action.ingredient]
        }
      }
    case t.UPDATE_RECIPE_NAME:
      return {
        ...state,
        [action.id]: { ...state[action.id], name: action.name }
      }
    case t.UPDATE_RECIPE_SOURCE:
      return {
        ...state,
        [action.id]: { ...state[action.id], source: action.source }
      }
    case t.UPDATE_RECIPE_TIME:
      return {
        ...state,
        [action.id]: { ...state[action.id], time: action.time }
      }
    case t.UPDATE_RECIPE_AUTHOR:
      return {
        ...state,
        [action.id]: { ...state[action.id], author: action.author }
      }
    case t.DELETE_INGREDIENT:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          ingredients: state[action.recipeID].ingredients.filter(
            x => x.id !== action.ingredientID
          )
        }
      }
    case t.UPDATE_INGREDIENT:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          ingredients: state[action.recipeID].ingredients.map(ingre => {
            if (ingre.id === action.ingredientID) {
              return { ...ingre, ...action.content }
            } else {
              return ingre
            }
          })
        }
      }
    case t.DELETE_STEP:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          steps: state[action.recipeID].steps.filter(
            x => x.id !== action.stepID
          )
        }
      }
    case t.UPDATE_STEP:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          steps: state[action.recipeID].steps.map(s => {
            if (s.id === action.stepID) {
              return { ...s, text: action.text, position: action.position }
            } else {
              return s
            }
          })
        }
      }
    case t.SET_RECIPES:
      // convert the array of objects to an object with the recipe.id as the
      // key, and the recipe as the value
      return action.recipes.reduce(
        (a: IRecipesState, b: IRecipe) => ({ ...a, [b.id]: b }),
        {}
      )
    case t.SET_DELETING_RECIPE:
      return {
        ...state,
        [action.id]: { ...state[action.id], deleting: action.val }
      }
    case t.SET_LOADING_RECIPE:
      return {
        ...state,
        [action.id]: { ...state[action.id], loading: action.val }
      }
    case t.SET_ADDING_INGREDIENT_TO_RECIPE:
      return {
        ...state,
        [action.id]: { ...state[action.id], addingIngredient: action.val }
      }
    case t.SET_UPDATING_INGREDIENT:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          ingredients: state[action.recipeID].ingredients.map(x => {
            if (x.id === action.ingredientID) {
              return {
                ...x,
                updating: action.val
              }
            }
            return x
          })
        }
      }
    case t.SET_REMOVING_INGREDIENT:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          ingredients: state[action.recipeID].ingredients.map(x => {
            if (x.id === action.ingredientID) {
              return {
                ...x,
                removing: action.val
              }
            }
            return x
          })
        }
      }
    case t.SET_UPDATING_STEP:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          steps: state[action.recipeID].steps.map(x => {
            if (x.id === action.stepID) {
              return {
                ...x,
                updating: action.val
              }
            }
            return x
          })
        }
      }
    case t.SET_REMOVING_STEP:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          steps: state[action.recipeID].steps.map(x => {
            if (x.id === action.stepID) {
              return {
                ...x,
                removing: action.val
              }
            }
            return x
          })
        }
      }
    case t.SET_RECIPE_UPDATING:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          updating: action.val
        }
      }
    case t.SET_RECIPE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data
        }
      }
    case t.UPDATE_RECIPE_OWNER:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          owner: action.owner
        }
      }
    case t.SET_SCHEDULING_RECIPE:
      return {
        ...state,
        [action.recipeID]: {
          ...state[action.recipeID],
          scheduling: action.scheduling
        }
      }
    default:
      return state
  }
}

export default recipes
