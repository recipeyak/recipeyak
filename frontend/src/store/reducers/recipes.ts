import { omit } from "lodash"
import { ITeam } from "@/store/reducers/teams"
import {
  createAsyncAction,
  ActionType,
  getType,
  createStandardAction
} from "typesafe-actions"
import { RootState } from "@/store/store"
import {
  WebData,
  HttpErrorKind,
  Success,
  Failure,
  isSuccessOrRefetching,
  unWrap,
  mapSuccessLike,
  toLoading
} from "@/webdata"

export const updateIngredient = createStandardAction("UPDATE_INGREDIENT")<{
  recipeID: IRecipe["id"]
  ingredientID: IIngredient["id"]
  content: IIngredient
}>()
export const updateRecipeOwner = createStandardAction("UPDATE_RECIPE_OWNER")<{
  id: IRecipe["id"]
  owner: IRecipe["owner"]
}>()
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
)<
  { teamID: TeamID },
  { recipes: IRecipe[]; teamID: TeamID },
  { teamID: TeamID }
>()

export interface IAddRecipeError {
  readonly errorWithName?: boolean
  readonly errorWithIngredients?: boolean
  readonly errorWithSteps?: boolean
}

export const createRecipe = createAsyncAction(
  "CREATE_RECIPE_START",
  "CREATE_RECIPE_SUCCESS",
  "CREATE_RECIPE_FAILURE"
)<void, IRecipe, IAddRecipeError>()

export const resetAddRecipeErrors = createStandardAction(
  "RESET_CREATE_RECIPE_ERRORS"
)()
export const deleteStep = createStandardAction("DELETE_STEP")<{
  recipeID: IRecipe["id"]
  stepID: IStep["id"]
}>()
export const updateStep = createStandardAction("UPDATE_STEP")<{
  recipeID: IRecipe["id"]
  stepID: IStep["id"]
  text: IStep["text"]
  position: IStep["position"]
}>()
export const setRemovingStep = createStandardAction("SET_REMOVING_STEP")<{
  recipeID: IRecipe["id"]
  stepID: IStep["id"]
  val: boolean
}>()
export const setUpdatingStep = createStandardAction("SET_UPDATING_STEP")<{
  recipeID: IRecipe["id"]
  stepID: IStep["id"]
  val: boolean
}>()
export const deleteIngredient = createStandardAction("DELETE_INGREDIENT")<{
  recipeID: IRecipe["id"]
  ingredientID: IIngredient["id"]
}>()
export const setRemovingIngredient = createStandardAction(
  "SET_REMOVING_INGREDIENT"
)<{
  recipeID: IIngredient["id"]
  ingredientID: IIngredient["id"]
  val: boolean
}>()
export const setUpdatingIngredient = createStandardAction(
  "SET_UPDATING_INGREDIENT"
)<{
  recipeID: IRecipe["id"]
  ingredientID: number
  val: boolean
}>()
export const setRecipeUpdating = createStandardAction("SET_RECIPE_UPDATING")<{
  id: IRecipe["id"]
  val: boolean
}>()
export const setLoadingAddStepToRecipe = createStandardAction(
  "SET_LOADING_ADD_STEP_TO_RECIPE"
)<{ id: IRecipe["id"]; val: boolean }>()
export const addStepToRecipe = createStandardAction("ADD_STEP_TO_RECIPE")<{
  id: IRecipe["id"]
  step: IStep
}>()
export const setAddingIngredientToRecipe = createStandardAction(
  "SET_ADDING_INGREDIENT_TO_RECIPE"
)<{ id: IRecipe["id"]; val: boolean }>()
export const addIngredientToRecipe = createStandardAction(
  "ADD_INGREDIENT_TO_RECIPE"
)<{
  id: IRecipe["id"]
  ingredient: IIngredient
}>()
export const setSchedulingRecipe = createStandardAction(
  "SET_SCHEDULING_RECIPE"
)<{
  recipeID: IRecipe["id"]
  scheduling: boolean
}>()
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

const mapSuccessLikeById = <T extends IRecipe["id"][]>(
  arr: WebData<T>,
  state: RootState
): WebData<IRecipe[]> =>
  mapSuccessLike(arr, a =>
    a
      .map(id => getRecipeById(state, id))
      .filter(isSuccessOrRefetching)
      .map(unWrap)
  )

export function getTeamRecipes(
  state: RootState,
  teamID: TeamID
): WebData<IRecipe[]> {
  const ids =
    teamID === "personal"
      ? state.recipes.personalIDs
      : state.recipes.teamIDs[teamID]
  return mapSuccessLikeById(ids, state)
}

export const getRecipeById = (
  state: RootState,
  id: IRecipe["id"]
): WebData<IRecipe> => state.recipes.byId[id]

export const getRecentRecipes = (state: RootState): WebData<IRecipe[]> =>
  mapSuccessLikeById(state.recipes.recentIds, state)

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
  if (!isSuccessOrRefetching(recipe)) {
    return state
  }
  return {
    ...state,
    byId: {
      ...state.byId,
      [id]: {
        ...recipe,
        data: func(unWrap(recipe))
      }
    }
  }
}

export interface IRecipesState {
  // add recipe page
  readonly creatingRecipe: boolean
  readonly errorCreatingRecipe: IAddRecipeError

  readonly byId: {
    readonly [key: number]: WebData<IRecipe>
  }
  readonly personalIDs: WebData<IRecipe["id"][]>
  readonly teamIDs: {
    readonly [key: number]: WebData<IRecipe["id"][]>
  }
  readonly recentIds: WebData<IRecipe["id"][]>
}

export const initialState: IRecipesState = {
  creatingRecipe: false,
  errorCreatingRecipe: {},
  byId: {},
  personalIDs: undefined,
  teamIDs: {},
  recentIds: undefined
}

export const recipes = (
  state: IRecipesState = initialState,
  action: RecipeActions
): IRecipesState => {
  switch (action.type) {
    case getType(fetchRecipe.request): {
      const r = state.byId[action.payload]
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload]: toLoading(r)
        }
      }
    }
    case getType(fetchRecipe.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: Success(action.payload)
        }
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
    case getType(fetchRecipeList.request): {
      if (action.payload.teamID === "personal") {
        return {
          ...state,
          personalIDs: toLoading(state.personalIDs)
        }
      }
      const teamIdsState = state.teamIDs[action.payload.teamID]
      return {
        ...state,
        teamIDs: {
          ...state.teamIDs,
          [action.payload.teamID]: toLoading(teamIdsState)
        }
      }
    }
    case getType(fetchRecipeList.success): {
      const newIds = action.payload.recipes.map(r => r.id)

      const newState = {
        ...state,
        byId: action.payload.recipes.reduce(
          (a, b) => ({
            ...a,
            [b.id]: Success(b)
          }),
          state.byId
        )
      }

      if (action.payload.teamID === "personal") {
        return { ...newState, personalIDs: Success(newIds) }
      }

      return {
        ...newState,
        teamIDs: {
          ...state.teamIDs,
          [action.payload.teamID]: Success(newIds)
        }
      }
    }
    case getType(fetchRecipeList.failure): {
      if (action.payload.teamID === "personal") {
        return {
          ...state,
          personalIDs: Failure(HttpErrorKind.other)
        }
      }
      return {
        ...state,
        teamIDs: {
          ...state.teamIDs,
          [action.payload.teamID]: Failure(HttpErrorKind.other)
        }
      }
    }
    case getType(fetchRecentRecipes.request): {
      return {
        ...state,
        recentIds: toLoading(state.recentIds)
      }
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
    case getType(createRecipe.request):
      return {
        ...state,
        creatingRecipe: true,
        errorCreatingRecipe: {}
      }
    case getType(createRecipe.success):
      return {
        ...state,
        creatingRecipe: false,
        errorCreatingRecipe: {},
        byId: {
          ...state.byId,
          [action.payload.id]: Success(action.payload)
        }
      }
    case getType(createRecipe.failure):
      return {
        ...state,
        creatingRecipe: false,
        errorCreatingRecipe: action.payload
      }
    case getType(resetAddRecipeErrors):
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
        personalIDs: mapSuccessLike(state.personalIDs, ids =>
          ids.filter(id => id !== action.payload)
        ),
        teamIDs: Object.entries(state.teamIDs).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: mapSuccessLike(value, v =>
              v.filter(id => id !== action.payload)
            )
          }),
          {}
        )
      }
    case getType(deleteRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, recipe => ({
        ...recipe,
        deleting: false
      }))
    case getType(addStepToRecipe):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        steps: recipe.steps.concat(action.payload.step)
      }))
    case getType(setLoadingAddStepToRecipe):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        addingStepToRecipe: action.payload.val
      }))
    case getType(addIngredientToRecipe):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.concat(action.payload.ingredient)
      }))
    case getType(deleteIngredient):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.filter(
          x => x.id !== action.payload.ingredientID
        )
      }))
    case getType(updateIngredient):
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
    case getType(deleteStep):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.filter(x => x.id !== action.payload.stepID)
      }))
    case getType(updateStep):
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
    case getType(setAddingIngredientToRecipe):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        addingIngredient: action.payload.val
      }))
    case getType(setUpdatingIngredient):
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
    case getType(setRemovingIngredient):
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
    case getType(setUpdatingStep):
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
    case getType(setRemovingStep):
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
    case getType(setRecipeUpdating):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        updating: action.payload.val
      }))
    case getType(updateRecipeOwner):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,

        owner: action.payload.owner
      }))
    case getType(setSchedulingRecipe):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        scheduling: action.payload.scheduling
      }))
    default:
      return state
  }
}

export default recipes
