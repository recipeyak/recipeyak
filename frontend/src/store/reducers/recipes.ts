import { omit } from "lodash"
import { ITeam } from "./teams"
import { action } from "typesafe-actions";


const ADD_RECIPE = "ADD_RECIPE"
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
const DELETE_RECIPE = "DELETE_RECIPE"
const SET_LOADING_RECIPE = "SET_LOADING_RECIPE"
const SET_DELETING_RECIPE = "SET_DELETING_RECIPE"
const SET_RECIPE = "SET_RECIPE"
const SET_ADDING_INGREDIENT_TO_RECIPE = "SET_ADDING_INGREDIENT_TO_RECIPE"
const SET_UPDATING_INGREDIENT = "SET_UPDATING_INGREDIENT"
const SET_REMOVING_INGREDIENT = "SET_REMOVING_INGREDIENT"
const SET_UPDATING_STEP = "SET_UPDATING_STEP"
const SET_REMOVING_STEP = "SET_REMOVING_STEP"
const SET_RECIPE_404 = "SET_RECIPE_404"
const SET_RECIPE_UPDATING = "SET_RECIPE_UPDATING"
const UPDATE_RECIPE_OWNER = "UPDATE_RECIPE_OWNER"
const SET_RECIPES = "SET_RECIPES"
const SET_SCHEDULING_RECIPE = "SET_SCHEDULING_RECIPE"



export const updateRecipeTime = (id: IRecipe['id'], time: IRecipe['time']) => action(
  UPDATE_RECIPE_TIME, {
  id,
  time
})


export const updateIngredient = (
  recipeID: IRecipe['id'],
  ingredientID: IIngredient['id'],
  content: IIngredient
) => action(
  UPDATE_INGREDIENT, {
  recipeID,
  ingredientID,
  content
})


export const updateRecipeOwner = (id: IRecipe['id'], owner: IRecipe['owner']) => action(
  UPDATE_RECIPE_OWNER, {
  id,
  owner
})

export const setDeletingRecipe = (id: IRecipe['id'], val: boolean) => action(
  SET_DELETING_RECIPE, {
  id,
  val
})

export const deleteRecipe = (id: IRecipe['id']) => action(
  DELETE_RECIPE, {
  id
})



export const deleteStep = (recipeID: IRecipe['id'], stepID: IStep['id']) => action(
  DELETE_STEP, {
  recipeID,
  stepID
})


export const updateStep = (
  recipeID: IRecipe['id'],
  stepID: IStep['id'],
  text: IStep['text'],
  position: IStep['position']
) => action(
  UPDATE_STEP, {
  recipeID,
  stepID,
  text,
  position
})

export const setRemovingStep = (
  recipeID: IRecipe['id'],
  stepID: IStep['id'],
  val: boolean
) => action(
  SET_REMOVING_STEP, {
  recipeID,
  stepID,
  val
})

export const setUpdatingStep = (
  recipeID: IRecipe['id'],
  stepID: IStep['id'],
  val: boolean
) => action(
  SET_UPDATING_STEP, {
  recipeID,
  stepID,
  val
})




export const deleteIngredient = (recipeID: IRecipe['id'], ingredientID: IIngredient['id']) => action(
  DELETE_INGREDIENT, {
  recipeID,
  ingredientID
})


export const setRemovingIngredient = (
  recipeID: IIngredient['id'],
  ingredientID: IIngredient['id'],
  val: boolean
) => action(
  SET_REMOVING_INGREDIENT, {
  recipeID,
  ingredientID,
  val
})

export const setUpdatingIngredient = (
  recipeID: IRecipe['id'],
  ingredientID: number,
  val: boolean
) => action(
  SET_UPDATING_INGREDIENT, {
  recipeID,
  ingredientID,
  val
})



export const setRecipe = (id: IRecipe['id'], data: IRecipe) => action(
  SET_RECIPE, {
  id,
  data
})

export const setRecipeUpdating = (id: IRecipe['id'], val: boolean) => action(
  SET_RECIPE_UPDATING, {
  id,
  val
})



export const updateRecipeAuthor = (id: IRecipe['id'], author: IRecipe['author']) => action(
  UPDATE_RECIPE_AUTHOR, {
  id,
  author
})


export const updateRecipeSource = (id: IRecipe['id'], source: IRecipe['source']) => action(
  UPDATE_RECIPE_SOURCE, {
  id,
  source
})


export const updateRecipeName = (id: IRecipe['id'], name: IRecipe['name']) => action(
  UPDATE_RECIPE_NAME, {
  id,
  name
})


export const addRecipe = (recipe: IRecipe) => action(
  ADD_RECIPE,
  recipe
)

export const setRecipe404 = (id: IRecipe['id'], val: boolean) => action(
  SET_RECIPE_404, {
  id,
  val
})

export const setLoadingRecipe = (id: IRecipe['id'], val: boolean) => action(
  SET_LOADING_RECIPE, {
  id,
  val
})



export const setRecipes = (recipes: IRecipe[]) => action(
  SET_RECIPES, {
  recipes
})

export const setLoadingAddStepToRecipe = (id: IRecipe['id'], val: boolean) => action(
  SET_LOADING_ADD_STEP_TO_RECIPE, {
  id,
  val
})

export const addStepToRecipe = (id: IRecipe['id'], step: IStep) => action(
  ADD_STEP_TO_RECIPE, {
  id,
  step
})

export const setAddingIngredientToRecipe = (id: IRecipe['id'], val: boolean) => action(
  SET_ADDING_INGREDIENT_TO_RECIPE, {
  id,
  val
})

export const addIngredientToRecipe = (id: IRecipe['id'], ingredient: IIngredient) => action(
  ADD_INGREDIENT_TO_RECIPE, {
  id,
  ingredient
})

export const setSchedulingRecipe = (
  recipeID: IRecipe["id"],
  scheduling: boolean
) => action(
  SET_SCHEDULING_RECIPE, {
  recipeID,
  scheduling

})


export type RecipeActions =
| ReturnType<typeof updateRecipeOwner>
| ReturnType<typeof setDeletingRecipe>
| ReturnType<typeof deleteRecipe>
| ReturnType<typeof deleteStep>
| ReturnType<typeof updateStep>
| ReturnType<typeof setRemovingStep>
| ReturnType<typeof setUpdatingStep>
| ReturnType<typeof deleteIngredient>
| ReturnType<typeof setRemovingIngredient>
| ReturnType<typeof setUpdatingIngredient>
| ReturnType<typeof setRecipe>
| ReturnType<typeof setRecipeUpdating>
| ReturnType<typeof updateRecipeAuthor>
| ReturnType<typeof updateRecipeSource>
| ReturnType<typeof updateRecipeName>
| ReturnType<typeof addRecipe>
| ReturnType<typeof setRecipe404>
| ReturnType<typeof setLoadingRecipe>
| ReturnType<typeof setRecipes>
| ReturnType<typeof setLoadingAddStepToRecipe>
| ReturnType<typeof addStepToRecipe>
| ReturnType<typeof setAddingIngredientToRecipe>
| ReturnType<typeof addIngredientToRecipe>
| ReturnType<typeof setSchedulingRecipe>
| ReturnType<typeof updateIngredient>
| ReturnType<typeof updateRecipeTime>




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
  action: RecipeActions
): IRecipesState => {
  switch (action.type) {
    case ADD_RECIPE:
      return { ...state, [action.payload.id]: action.payload}
    case DELETE_RECIPE:
      return omit(state, action.payload.id)
    case ADD_STEP_TO_RECIPE:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          steps: state[action.payload.id].steps.concat(action.payload.step)
        }
      }
    case SET_LOADING_ADD_STEP_TO_RECIPE:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          addingStepToRecipe: action.payload.val
        }
      }
    case SET_RECIPE_404:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          error404: action.payload.val
        }
      }
    case ADD_INGREDIENT_TO_RECIPE:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          ingredients: [...state[action.payload.id].ingredients, action.payload.ingredient]
        }
      }
    case UPDATE_RECIPE_NAME:
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], name: action.payload.name }
      }
    case UPDATE_RECIPE_SOURCE:
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], source: action.payload.source }
      }
    case UPDATE_RECIPE_TIME:
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], time: action.payload.time }
      }
    case UPDATE_RECIPE_AUTHOR:
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], author: action.payload.author }
      }
    case DELETE_INGREDIENT:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          ingredients: state[action.payload.recipeID].ingredients.filter(
            x => x.id !== action.payload.ingredientID
          )
        }
      }
    case UPDATE_INGREDIENT:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          ingredients: state[action.payload.recipeID].ingredients.map(ingre => {
            if (ingre.id === action.payload.ingredientID) {
              return { ...ingre, ...action.payload.content }
            } else {
              return ingre
            }
          })
        }
      }
    case DELETE_STEP:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          steps: state[action.payload.recipeID].steps.filter(
            x => x.id !== action.payload.stepID
          )
        }
      }
    case UPDATE_STEP:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          steps: state[action.payload.recipeID].steps.map(s => {
            if (s.id === action.payload.stepID) {
              return { ...s, text: action.payload.text, position: action.payload.position }
            } else {
              return s
            }
          })
        }
      }
    case SET_RECIPES:
      // convert the array of objects to an object with the recipe.id as the
      // key, and the recipe as the value
      return action.payload.recipes.reduce(
        (a, b) => ({ ...a, [b.id]: b }),
        {}
      )
    case SET_DELETING_RECIPE:
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], deleting: action.payload.val }
      }
    case SET_LOADING_RECIPE:
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], loading: action.payload.val }
      }
    case SET_ADDING_INGREDIENT_TO_RECIPE:
      return {
        ...state,
        [action.payload.id]: { ...state[action.payload.id], addingIngredient: action.payload.val }
      }
    case SET_UPDATING_INGREDIENT:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          ingredients: state[action.payload.recipeID].ingredients.map(x => {
            if (x.id === action.payload.ingredientID) {
              return {
                ...x,
                updating: action.payload.val
              }
            }
            return x
          })
        }
      }
    case SET_REMOVING_INGREDIENT:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          ingredients: state[action.payload.recipeID].ingredients.map(x => {
            if (x.id === action.payload.ingredientID) {
              return {
                ...x,
                removing: action.payload.val
              }
            }
            return x
          })
        }
      }
    case SET_UPDATING_STEP:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          steps: state[action.payload.recipeID].steps.map(x => {
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
    case SET_REMOVING_STEP:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          steps: state[action.payload.recipeID].steps.map(x => {
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
    case SET_RECIPE_UPDATING:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          updating: action.payload.val
        }
      }
    case SET_RECIPE:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          ...action.payload.data
        }
      }
    case UPDATE_RECIPE_OWNER:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          owner: action.payload.owner
        }
      }
    case SET_SCHEDULING_RECIPE:
      return {
        ...state,
        [action.payload.recipeID]: {
          ...state[action.payload.recipeID],
          scheduling: action.payload.scheduling
        }
      }
    default:
      return state
  }
}

export default recipes
