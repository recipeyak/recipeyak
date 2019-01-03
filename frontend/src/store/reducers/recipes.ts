import { omit, uniq } from "lodash"
import { ITeam } from "@/store/reducers/teams"
import {
  action as act,
  createAsyncAction,
  ActionType,
  getType
} from "typesafe-actions"
import { RootState } from "@/store/store"
import {
  WebData,
  HttpErrorKind,
  isInitial,
  isSuccess,
  Loading,
  Success,
  Failure
} from "@/store/remotedata"
const ADD_STEP_TO_RECIPE = "ADD_STEP_TO_RECIPE"
const ADD_INGREDIENT_TO_RECIPE = "ADD_INGREDIENT_TO_RECIPE"
const SET_LOADING_ADD_STEP_TO_RECIPE = "SET_LOADING_ADD_STEP_TO_RECIPE"
const DELETE_INGREDIENT = "DELETE_INGREDIENT"
const UPDATE_INGREDIENT = "UPDATE_INGREDIENT"
const DELETE_STEP = "DELETE_STEP"
const UPDATE_STEP = "UPDATE_STEP"
const SET_ADDING_INGREDIENT_TO_RECIPE = "SET_ADDING_INGREDIENT_TO_RECIPE"
const SET_UPDATING_INGREDIENT = "SET_UPDATING_INGREDIENT"
const SET_REMOVING_INGREDIENT = "SET_REMOVING_INGREDIENT"
const SET_UPDATING_STEP = "SET_UPDATING_STEP"
const SET_REMOVING_STEP = "SET_REMOVING_STEP"
const SET_RECIPE_UPDATING = "SET_RECIPE_UPDATING"
const UPDATE_RECIPE_OWNER = "UPDATE_RECIPE_OWNER"
const SET_SCHEDULING_RECIPE = "SET_SCHEDULING_RECIPE"
const CREATE_RECIPE_START = "CREATE_RECIPE_START"
const CREATE_RECIPE_SUCCESS = "CREATE_RECIPE_SUCCESS"
const CREATE_RECIPE_FAILURE = "CREATE_RECIPE_FAILURE"
const RESET_CREATE_RECIPE_ERRORS = "RESET_CREATE_RECIPE_ERRORS"

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
  "DELETE_RECIPE_START",
  "DELETE_RECIPE_SUCCESS",
  "DELETE_RECIPE_FAILURE"
)<IRecipe["id"], IRecipe["id"], IRecipe["id"]>()

export const fetchRecipe = createAsyncAction(
  "FETCH_RECIPE_START",
  "FETCH_RECIPE_SUCCESS",
  "FETCH_RECIPE_FAILURE"
)<IRecipe["id"], IRecipe, { id: IRecipe["id"]; error404: boolean }>()

export const fetchRecipeList = createAsyncAction(
  "FETCH_RECIPE_LIST_START",
  "FETCH_RECIPE_LIST_SUCCESS",
  "FETCH_RECIPE_LIST_FAILURE"
)<void, IRecipe[], void>()

export interface IAddRecipeError {
  readonly errorWithName?: boolean
  readonly errorWithIngredients?: boolean
  readonly errorWithSteps?: boolean
}

export const createRecipe = createAsyncAction(
  CREATE_RECIPE_START,
  CREATE_RECIPE_SUCCESS,
  CREATE_RECIPE_FAILURE
)<void, IRecipe, IAddRecipeError>()

export const resetAddRecipeErrors = () => act(RESET_CREATE_RECIPE_ERRORS)

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

export const fetchRecentRecipes = createAsyncAction(
  "FETCH_RECENT_RECIPES_START",
  "FETCH_RECENT_RECIPES_SUCCESS",
  "FETCH_RECENT_RECIPES_FAILURE"
)<void, IRecipe[], void>()

export interface IRecipeBasic
  extends Omit<
    IRecipe,
    | "id"
    | "edits"
    | "modified"
    | "last_scheduled"
    | "owner"
    | "team"
    | "ingredients"
    | "steps"
  > {
  readonly ingredients: IIngredientBasic[]
  readonly steps: IStepBasic[]
  readonly team?: ITeam["id"]
}
export type IIngredientBasic = Omit<IIngredient, "id" | "position">

export type IStepBasic = Pick<IStep, "text">

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
  | ReturnType<typeof setLoadingAddStepToRecipe>
  | ReturnType<typeof addStepToRecipe>
  | ReturnType<typeof setAddingIngredientToRecipe>
  | ReturnType<typeof addIngredientToRecipe>
  | ReturnType<typeof setSchedulingRecipe>
  | ReturnType<typeof updateIngredient>
  | ActionType<typeof deleteRecipe>
  | ActionType<typeof fetchRecipe>
  | ActionType<typeof fetchRecipeList>
  | ActionType<typeof createRecipe>
  | ActionType<typeof fetchRecentRecipes>
  | ReturnType<typeof resetAddRecipeErrors>

export const getRecipes = (state: RootState): WebData<IRecipe>[] =>
  state.recipes.allIds.map(id => state.recipes.byId[id])

export const getRecipeById = (
  state: RootState,
  id: IRecipe["id"]
): WebData<IRecipe> => state.recipes.byId[id]

export const getRecentRecipes = (state: RootState): WebData<IRecipe[]> =>
  isSuccess(state.recipes.recentIds)
    ? Success(
        state.recipes.recentIds.data
          .map(id => state.recipes.byId[id])
          .filter(isSuccess)
          .map(recipe => recipe.data)
      )
    : state.recipes.recentIds

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

  readonly deleting?: boolean
  readonly addingStepToRecipe?: boolean
  readonly addingIngredient?: boolean
  readonly scheduling?: boolean
  readonly updating?: boolean
}

function mapRecipeSuccessById(
  state: IRecipesState,
  id: IRecipe["id"],
  func: (recipe: IRecipe) => IRecipe
): IRecipesState {
  const recipe = state.byId[id]
  if (isInitial(recipe) || !isSuccess(recipe)) {
    return state
  }
  return {
    ...state,
    byId: {
      ...state.byId,
      [id]: {
        ...recipe,
        data: func(recipe.data)
      }
    }
  }
}

export interface IRecipesState {
  /** Represents the loading state for the list view.
   *  Currently shared by other views as well, but should be eliminated
   *  once we move to sum-types for our data fetching states.
   */
  readonly loadingAll: boolean
  readonly errorLoadingAll: boolean

  // add recipe page
  readonly creatingRecipe: boolean
  readonly errorCreatingRecipe: IAddRecipeError

  readonly byId: {
    readonly [key: number]: WebData<IRecipe>
  }
  readonly allIds: IRecipe["id"][]
  readonly recentIds: WebData<IRecipe["id"][]>
}

export const initialState: IRecipesState = {
  loadingAll: false,
  errorLoadingAll: false,

  creatingRecipe: false,
  errorCreatingRecipe: {},
  byId: {},
  allIds: [],
  recentIds: undefined
}

export const recipes = (
  state: IRecipesState = initialState,
  action: RecipeActions
): IRecipesState => {
  switch (action.type) {
    case getType(fetchRecipe.request):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload]: Loading()
        }
      }
    case getType(fetchRecipe.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: Success(action.payload)
        },
        allIds: uniq(state.allIds.concat(action.payload.id))
      }
    case getType(fetchRecipe.failure): {
      const failure = action.payload.error404
        ? HttpErrorKind.error404
        : HttpErrorKind.other
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: Failure(failure)
        }
      }
    }
    case getType(fetchRecipeList.request):
      return {
        ...state,
        loadingAll: true
      }
    case getType(fetchRecipeList.success):
      return {
        ...state,
        loadingAll: false,
        errorLoadingAll: false,
        byId: action.payload.reduce(
          (a, b) => ({
            ...a,
            [b.id]: Success(b)
          }),
          state.byId
        ),
        allIds: action.payload.map(r => r.id)
      }
    case getType(fetchRecipeList.failure):
      return {
        ...state,
        loadingAll: false,
        errorLoadingAll: true
      }
    case getType(fetchRecentRecipes.request):
      return {
        ...state,
        recentIds: Loading()
      }
    case getType(fetchRecentRecipes.success):
      return {
        ...state,
        byId: action.payload.reduce(
          (a, b) => ({
            ...a,
            [b.id]: Success(b)
          }),
          state.byId
        ),
        recentIds: Success(action.payload.map(r => r.id))
      }
    case getType(fetchRecentRecipes.failure):
      return {
        ...state,
        recentIds: Failure(HttpErrorKind.other)
      }
    case CREATE_RECIPE_START:
      return {
        ...state,
        creatingRecipe: true,
        errorCreatingRecipe: {}
      }
    case CREATE_RECIPE_SUCCESS:
      return {
        ...state,
        creatingRecipe: false,
        errorCreatingRecipe: {},
        byId: {
          ...state.byId,
          [action.payload.id]: Success(action.payload)
        },
        allIds: uniq(state.allIds.concat(action.payload.id))
      }
    case CREATE_RECIPE_FAILURE:
      return {
        ...state,
        creatingRecipe: false,
        errorCreatingRecipe: action.payload
      }
    case RESET_CREATE_RECIPE_ERRORS:
      return {
        ...state,
        errorCreatingRecipe: {}
      }
    case getType(deleteRecipe.request):
      return mapRecipeSuccessById(state, action.payload, recipe => ({
        ...recipe,
        deleting: true
      }))
    case getType(deleteRecipe.success):
      return {
        ...state,
        byId: omit(state.byId, action.payload),
        allIds: state.allIds.filter(id => id !== action.payload)
      }
    case getType(deleteRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, recipe => ({
        ...recipe,
        deleting: false
      }))
    case ADD_STEP_TO_RECIPE:
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        steps: recipe.steps.concat(action.payload.step)
      }))
    case SET_LOADING_ADD_STEP_TO_RECIPE:
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        addingStepToRecipe: action.payload.val
      }))
    case ADD_INGREDIENT_TO_RECIPE:
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.concat(action.payload.ingredient)
      }))
    case DELETE_INGREDIENT:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.filter(
          x => x.id !== action.payload.ingredientID
        )
      }))
    case UPDATE_INGREDIENT:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(ingre => {
          if (ingre.id === action.payload.ingredientID) {
            return { ...ingre, ...action.payload.content }
          } else {
            return ingre
          }
        })
      }))
    case DELETE_STEP:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.filter(x => x.id !== action.payload.stepID)
      }))
    case UPDATE_STEP:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.map(s => {
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
      }))
    case SET_ADDING_INGREDIENT_TO_RECIPE:
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        addingIngredient: action.payload.val
      }))
    case SET_UPDATING_INGREDIENT:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(x => {
          if (x.id === action.payload.ingredientID) {
            return {
              ...x,
              updating: action.payload.val
            }
          }
          return x
        })
      }))
    case SET_REMOVING_INGREDIENT:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(x => {
          if (x.id === action.payload.ingredientID) {
            return {
              ...x,
              removing: action.payload.val
            }
          }
          return x
        })
      }))
    case SET_UPDATING_STEP:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.map(x => {
          if (x.id === action.payload.stepID) {
            return {
              ...x,
              updating: action.payload.val
            }
          }
          return x
        })
      }))
    case SET_REMOVING_STEP:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.map(x => {
          if (x.id === action.payload.stepID) {
            return {
              ...x,
              removing: action.payload.val
            }
          }
          return x
        })
      }))
    case SET_RECIPE_UPDATING:
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        updating: action.payload.val
      }))
    case UPDATE_RECIPE_OWNER:
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,

        owner: action.payload.owner
      }))

    case SET_SCHEDULING_RECIPE:
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        scheduling: action.payload.scheduling
      }))
    default:
      return state
  }
}

export default recipes
