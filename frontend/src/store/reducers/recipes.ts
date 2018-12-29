import { omit, uniq } from "lodash"
import { ITeam } from "@/store/reducers/teams"
import { action as act, createAsyncAction, ActionType } from "typesafe-actions"
import { RootState } from "@/store/store"

const ADD_STEP_TO_RECIPE = "ADD_STEP_TO_RECIPE"
const ADD_INGREDIENT_TO_RECIPE = "ADD_INGREDIENT_TO_RECIPE"
const SET_LOADING_ADD_STEP_TO_RECIPE = "SET_LOADING_ADD_STEP_TO_RECIPE"
const UPDATE_RECIPE_NAME = "UPDATE_RECIPE_NAME"
const UPDATE_RECIPE_SOURCE = "UPDATE_RECIPE_SOURCE"
const UPDATE_RECIPE_AUTHOR = "UPDATE_RECIPE_AUTHOR"
const UPDATE_RECIPE_TIME = "UPDATE_RECIPE_TIME"
const DELETE_INGREDIENT = "DELETE_INGREDIENT"
const UPDATE_INGREDIENT = "UPDATE_INGREDIENT"
const DELETE_STEP = "DELETE_STEP"
const UPDATE_STEP = "UPDATE_STEP"
const DELETE_RECIPE_START = "DELETE_RECIPE_START"
const DELETE_RECIPE_SUCCESS = "DELETE_RECIPE_SUCCESS"
const DELETE_RECIPE_FAILURE = "DELETE_RECIPE_FAILURE"
const SET_ADDING_INGREDIENT_TO_RECIPE = "SET_ADDING_INGREDIENT_TO_RECIPE"
const SET_UPDATING_INGREDIENT = "SET_UPDATING_INGREDIENT"
const SET_REMOVING_INGREDIENT = "SET_REMOVING_INGREDIENT"
const SET_UPDATING_STEP = "SET_UPDATING_STEP"
const SET_REMOVING_STEP = "SET_REMOVING_STEP"
const SET_RECIPE_UPDATING = "SET_RECIPE_UPDATING"
const UPDATE_RECIPE_OWNER = "UPDATE_RECIPE_OWNER"
const SET_SCHEDULING_RECIPE = "SET_SCHEDULING_RECIPE"
const FETCH_RECIPE_START = "FETCH_RECIPE_START"
const FETCH_RECIPE_SUCCESS = "FETCH_RECIPE_SUCCESS"
const FETCH_RECIPE_FAILURE = "FETCH_RECIPE_FAILURE"
const FETCH_RECIPE_LIST_START = "FETCH_RECIPE_LIST_START"
const FETCH_RECIPE_LIST_SUCCESS = "FETCH_RECIPE_LIST_SUCCESS"
const FETCH_RECIPE_LIST_FAILURE = "FETCH_RECIPE_LIST_FAILURE"

export const updateRecipeTime = (id: IRecipe["id"], time: IRecipe["time"]) =>
  act(UPDATE_RECIPE_TIME, {
    id,
    time
  })

export const updateIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"],
  content: IIngredient
) =>
  act(UPDATE_INGREDIENT, {
    recipeID,
    ingredientID,
    content
  })

export const updateRecipeOwner = (id: IRecipe["id"], owner: IRecipe["owner"]) =>
  act(UPDATE_RECIPE_OWNER, {
    id,
    owner
  })

export const deleteRecipe = createAsyncAction(
  DELETE_RECIPE_START,
  DELETE_RECIPE_SUCCESS,
  DELETE_RECIPE_FAILURE
)<IRecipe["id"], IRecipe["id"], IRecipe["id"]>()

export const fetchRecipe = createAsyncAction(
  FETCH_RECIPE_START,
  FETCH_RECIPE_SUCCESS,
  FETCH_RECIPE_FAILURE
)<IRecipe["id"], IRecipe, { id: IRecipe["id"]; error404: boolean }>()

export const fetchRecipeList = createAsyncAction(
  FETCH_RECIPE_LIST_START,
  FETCH_RECIPE_LIST_SUCCESS,
  FETCH_RECIPE_LIST_FAILURE
)<void, IRecipe[], void>()

export const deleteStep = (recipeID: IRecipe["id"], stepID: IStep["id"]) =>
  act(DELETE_STEP, {
    recipeID,
    stepID
  })

export const updateStep = (
  recipeID: IRecipe["id"],
  stepID: IStep["id"],
  text: IStep["text"],
  position: IStep["position"]
) =>
  act(UPDATE_STEP, {
    recipeID,
    stepID,
    text,
    position
  })

export const setRemovingStep = (
  recipeID: IRecipe["id"],
  stepID: IStep["id"],
  val: boolean
) =>
  act(SET_REMOVING_STEP, {
    recipeID,
    stepID,
    val
  })

export const setUpdatingStep = (
  recipeID: IRecipe["id"],
  stepID: IStep["id"],
  val: boolean
) =>
  act(SET_UPDATING_STEP, {
    recipeID,
    stepID,
    val
  })

export const deleteIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"]
) =>
  act(DELETE_INGREDIENT, {
    recipeID,
    ingredientID
  })

export const setRemovingIngredient = (
  recipeID: IIngredient["id"],
  ingredientID: IIngredient["id"],
  val: boolean
) =>
  act(SET_REMOVING_INGREDIENT, {
    recipeID,
    ingredientID,
    val
  })

export const setUpdatingIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: number,
  val: boolean
) =>
  act(SET_UPDATING_INGREDIENT, {
    recipeID,
    ingredientID,
    val
  })

export const setRecipeUpdating = (id: IRecipe["id"], val: boolean) =>
  act(SET_RECIPE_UPDATING, {
    id,
    val
  })

export const updateRecipeAuthor = (
  id: IRecipe["id"],
  author: IRecipe["author"]
) =>
  act(UPDATE_RECIPE_AUTHOR, {
    id,
    author
  })

export const updateRecipeSource = (
  id: IRecipe["id"],
  source: IRecipe["source"]
) =>
  act(UPDATE_RECIPE_SOURCE, {
    id,
    source
  })

export const updateRecipeName = (id: IRecipe["id"], name: IRecipe["name"]) =>
  act(UPDATE_RECIPE_NAME, {
    id,
    name
  })

export const setLoadingAddStepToRecipe = (id: IRecipe["id"], val: boolean) =>
  act(SET_LOADING_ADD_STEP_TO_RECIPE, {
    id,
    val
  })

export const addStepToRecipe = (id: IRecipe["id"], step: IStep) =>
  act(ADD_STEP_TO_RECIPE, {
    id,
    step
  })

export const setAddingIngredientToRecipe = (id: IRecipe["id"], val: boolean) =>
  act(SET_ADDING_INGREDIENT_TO_RECIPE, {
    id,
    val
  })

export const addIngredientToRecipe = (
  id: IRecipe["id"],
  ingredient: IIngredient
) =>
  act(ADD_INGREDIENT_TO_RECIPE, {
    id,
    ingredient
  })

export const setSchedulingRecipe = (
  recipeID: IRecipe["id"],
  scheduling: boolean
) =>
  act(SET_SCHEDULING_RECIPE, {
    recipeID,
    scheduling
  })

export type RecipeActions =
  | ReturnType<typeof updateRecipeOwner>
  | ReturnType<typeof deleteStep>
  | ReturnType<typeof updateStep>
  | ReturnType<typeof setRemovingStep>
  | ReturnType<typeof setUpdatingStep>
  | ReturnType<typeof deleteIngredient>
  | ReturnType<typeof setRemovingIngredient>
  | ReturnType<typeof setUpdatingIngredient>
  | ReturnType<typeof setRecipeUpdating>
  | ReturnType<typeof updateRecipeAuthor>
  | ReturnType<typeof updateRecipeSource>
  | ReturnType<typeof updateRecipeName>
  | ReturnType<typeof setLoadingAddStepToRecipe>
  | ReturnType<typeof addStepToRecipe>
  | ReturnType<typeof setAddingIngredientToRecipe>
  | ReturnType<typeof addIngredientToRecipe>
  | ReturnType<typeof setSchedulingRecipe>
  | ReturnType<typeof updateIngredient>
  | ReturnType<typeof updateRecipeTime>
  | ActionType<typeof deleteRecipe>
  | ActionType<typeof fetchRecipe>
  | ActionType<typeof fetchRecipeList>

export const getRecipes = (state: RootState) =>
  state.recipes.allIds.map(id => state.recipes.byId[id])

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
  /** Represents the loading state for the list view.
   *  Currently shared by other views as well, but should be eliminated
   *  once we move to sum-types for our data fetching states.
   */
  readonly loadingAll: boolean
  readonly errorLoadingAll: boolean
  readonly byId: {
    readonly [key: number]: IRecipe
  }
  readonly allIds: IRecipe["id"][]
}

export const initialState: IRecipesState = {
  loadingAll: false,
  errorLoadingAll: false,
  byId: {},
  allIds: []
}

export const recipes = (
  state: IRecipesState = initialState,
  action: RecipeActions
): IRecipesState => {
  switch (action.type) {
    case FETCH_RECIPE_START:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload]: {
            ...state.byId[action.payload],
            loading: true
          }
        },
        allIds: uniq(state.allIds.concat(action.payload))
      }
    case FETCH_RECIPE_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ...action.payload,
            loading: false
          }
        },
        allIds: uniq(state.allIds.concat(action.payload.id))
      }
    case FETCH_RECIPE_FAILURE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            error404: action.payload.error404,
            loading: false
          }
        }
      }

    case FETCH_RECIPE_LIST_START: {
      return {
        ...state,
        loadingAll: true
      }
    }
    case FETCH_RECIPE_LIST_SUCCESS: {
      return {
        ...state,
        loadingAll: false,
        errorLoadingAll: false,
        byId: action.payload.reduce((a, b) => ({ ...a, [b.id]: b }), {}),
        allIds: action.payload.map(r => r.id)
      }
    }
    case FETCH_RECIPE_LIST_FAILURE: {
      return {
        ...state,
        loadingAll: false,
        errorLoadingAll: true
      }
    }
    case DELETE_RECIPE_START:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload]: {
            ...state.byId[action.payload],
            deleting: true
          }
        }
      }
    case DELETE_RECIPE_SUCCESS:
      return {
        ...state,
        byId: omit(state.byId, action.payload),
        allIds: state.allIds.filter(id => id !== action.payload)
      }
    case DELETE_RECIPE_FAILURE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload]: {
            ...state.byId[action.payload],
            deleting: false
          }
        }
      }
    case ADD_STEP_TO_RECIPE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            steps: state.byId[action.payload.id].steps.concat(
              action.payload.step
            )
          }
        }
      }
    case SET_LOADING_ADD_STEP_TO_RECIPE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            addingStepToRecipe: action.payload.val
          }
        }
      }

    case ADD_INGREDIENT_TO_RECIPE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            ingredients: [
              ...state.byId[action.payload.id].ingredients,
              action.payload.ingredient
            ]
          }
        }
      }
    case UPDATE_RECIPE_NAME:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            name: action.payload.name
          }
        }
      }
    case UPDATE_RECIPE_SOURCE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            source: action.payload.source
          }
        }
      }
    case UPDATE_RECIPE_TIME:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            time: action.payload.time
          }
        }
      }
    case UPDATE_RECIPE_AUTHOR:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            author: action.payload.author
          }
        }
      }
    case DELETE_INGREDIENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            ingredients: state.byId[action.payload.recipeID].ingredients.filter(
              x => x.id !== action.payload.ingredientID
            )
          }
        }
      }
    case UPDATE_INGREDIENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            ingredients: state.byId[action.payload.recipeID].ingredients.map(
              ingre => {
                if (ingre.id === action.payload.ingredientID) {
                  return { ...ingre, ...action.payload.content }
                } else {
                  return ingre
                }
              }
            )
          }
        }
      }
    case DELETE_STEP:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            steps: state.byId[action.payload.recipeID].steps.filter(
              x => x.id !== action.payload.stepID
            )
          }
        }
      }
    case UPDATE_STEP:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            steps: state.byId[action.payload.recipeID].steps.map(s => {
              if (s.id === action.payload.stepID) {
                return {
                  ...s,
                  text: action.payload.text,
                  position: action.payload.position
                }
              } else {
                return s
              }
            })
          }
        }
      }
    case SET_ADDING_INGREDIENT_TO_RECIPE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            addingIngredient: action.payload.val
          }
        }
      }
    case SET_UPDATING_INGREDIENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            ingredients: state.byId[action.payload.recipeID].ingredients.map(
              x => {
                if (x.id === action.payload.ingredientID) {
                  return {
                    ...x,
                    updating: action.payload.val
                  }
                }
                return x
              }
            )
          }
        }
      }
    case SET_REMOVING_INGREDIENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            ingredients: state.byId[action.payload.recipeID].ingredients.map(
              x => {
                if (x.id === action.payload.ingredientID) {
                  return {
                    ...x,
                    removing: action.payload.val
                  }
                }
                return x
              }
            )
          }
        }
      }
    case SET_UPDATING_STEP:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            steps: state.byId[action.payload.recipeID].steps.map(x => {
              if (x.id === action.payload.stepID) {
                return {
                  ...x,
                  updating: action.payload.val
                }
              }
              return x
            })
          }
        }
      }
    case SET_REMOVING_STEP:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            steps: state.byId[action.payload.recipeID].steps.map(x => {
              if (x.id === action.payload.stepID) {
                return {
                  ...x,
                  removing: action.payload.val
                }
              }
              return x
            })
          }
        }
      }
    case SET_RECIPE_UPDATING:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            updating: action.payload.val
          }
        }
      }
    case UPDATE_RECIPE_OWNER:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...state.byId[action.payload.id],
            owner: action.payload.owner
          }
        }
      }
    case SET_SCHEDULING_RECIPE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.recipeID]: {
            ...state.byId[action.payload.recipeID],
            scheduling: action.payload.scheduling
          }
        }
      }
    default:
      return state
  }
}

export default recipes
