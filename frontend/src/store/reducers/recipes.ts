import { omit } from "lodash"
import { ITeam } from "@/store/reducers/teams"
import * as api from "@/api"
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
import { isOk } from "@/result"
import { Loop, loop, Cmd } from "redux-loop"
import { Dispatch } from "@/store/thunks"
import { push } from "react-router-redux"

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

export const deleteStep = createAsyncAction(
  "DELETE_STEP_REQUEST",
  "DELETE_STEP_SUCCESS",
  "DELETE_STEP_FAILURE"
)<
  {
    recipeID: IRecipe["id"]
    stepID: IStep["id"]
  },
  {
    recipeID: IRecipe["id"]
    stepID: IStep["id"]
  },
  {
    recipeID: IRecipe["id"]
    stepID: IStep["id"]
  }
>()

export const updateStep = createAsyncAction(
  "UPDATING_STEP_REQUEST",
  "UPDATING_STEP_SUCCESS",
  "UPDATING_STEP_FAILURE"
)<
  {
    recipeID: IRecipe["id"]
    stepID: IStep["id"]
  },
  {
    recipeID: IRecipe["id"]
    stepID: IStep["id"]
    text: IStep["text"]
    position: IStep["position"]
  },
  {
    recipeID: IRecipe["id"]
    stepID: IStep["id"]
  }
>()

export const deleteIngredient = createAsyncAction(
  "DELETE_INGREDIENT_REQUEST",
  "DELETE_INGREDIENT_SUCCESS",
  "DELETE_INGREDIENT_FAILURE"
)<
  {
    recipeID: IRecipe["id"]
    ingredientID: IIngredient["id"]
  },
  {
    recipeID: IRecipe["id"]
    ingredientID: IIngredient["id"]
  },
  {
    recipeID: IRecipe["id"]
    ingredientID: IIngredient["id"]
  }
>()

export const updateIngredient = createAsyncAction(
  "UPDATE_INGREDIENT_REQUEST",
  "UPDATE_INGREDIENT_SUCCESS",
  "UPDATE_INGREDIENT_FAILURE"
)<
  {
    recipeID: IRecipe["id"]
    ingredientID: IIngredient["id"]
    content: Partial<Omit<IIngredient, "id" | "position">>
  },
  {
    recipeID: IRecipe["id"]
    ingredientID: IIngredient["id"]
    content: IIngredient
  },
  { recipeID: IRecipe["id"]; ingredientID: IIngredient["id"] }
>()

export const updateRecipe = createAsyncAction(
  "UPDATE_RECIPE_REQUEST",
  "UPDATE_RECIPE_SUCCESS",
  "UPDATE_RECIPE_FAILIURE"
)<
  { id: IRecipe["id"]; data: Partial<Omit<IRecipe, "id">> },
  IRecipe,
  IRecipe["id"]
>()

export const addStepToRecipe = createAsyncAction(
  "ADD_STEP_TO_RECIPE_REQUEST",
  "ADD_STEP_TO_RECIPE_SUCCESS",
  "ADD_STEP_TO_RECIPE_FAILURE"
)<
  {
    id: IRecipe["id"]
    step: IStep["text"]
  },
  {
    id: IRecipe["id"]
    step: IStep
  },
  IRecipe["id"]
>()

export const addIngredientToRecipe = createAsyncAction(
  "ADD_INGREDIENT_TO_RECIPE_REQUEST",
  "ADD_INGREDIENT_TO_RECIPE_SUCCESS",
  "ADD_INGREDIENT_TO_RECIPE_FAILURE"
)<
  {
    recipeID: IRecipe["id"]
    // TODO(sbdchd): this type should be more specific
    ingredient: Partial<Omit<IIngredient, "id">>
  },
  {
    id: IRecipe["id"]
    ingredient: IIngredient
  },
  IRecipe["id"]
>()

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
  | ActionType<typeof deleteStep>
  | ActionType<typeof updateStep>
  | ActionType<typeof deleteIngredient>
  | ActionType<typeof updateRecipe>
  | ActionType<typeof addStepToRecipe>
  | ActionType<typeof addIngredientToRecipe>
  | ReturnType<typeof setSchedulingRecipe>
  | ActionType<typeof updateIngredient>
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
): IRecipesState | Loop<IRecipesState, RecipeActions> => {
  switch (action.type) {
    case getType(fetchRecipe.request): {
      const recipeID = action.payload
      const r = state.byId[recipeID]
      return loop(
        {
          ...state,
          byId: {
            ...state.byId,
            [recipeID]: toLoading(r)
          }
        },
        Cmd.run(
          (dispatch: Dispatch) =>
            api.getRecipe(recipeID).then(res => {
              if (isOk(res)) {
                dispatch(fetchRecipe.success(res.data))
              } else {
                const error404 = !!(
                  res.error.response && res.error.response.status === 404
                )
                dispatch(
                  fetchRecipe.failure({
                    id: recipeID,
                    error404
                  })
                )
              }
            }),
          {
            args: [Cmd.dispatch]
          }
        )
      )
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
      return loop(
        mapRecipeSuccessById(state, action.payload, recipe => ({
          ...recipe,
          deleting: true
        })),
        Cmd.run(
          async (dispatch: Dispatch) => {
            const res = await api.deleteRecipe(action.payload)
            if (isOk(res)) {
              dispatch(push("/recipes"))
              dispatch(deleteRecipe.success(action.payload))
            } else {
              dispatch(deleteRecipe.failure(action.payload))
            }
          },
          { args: [Cmd.dispatch] }
        )
      )
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
    case getType(addStepToRecipe.request):
      return loop(
        mapRecipeSuccessById(state, action.payload.id, recipe => ({
          ...recipe,
          addingStepToRecipe: true
        })),
        Cmd.run(
          async (dispatch: Dispatch) => {
            const res = await api.addStepToRecipe(
              action.payload.id,
              action.payload.step
            )
            if (isOk(res)) {
              dispatch(
                addStepToRecipe.success({
                  id: action.payload.id,
                  step: res.data
                })
              )
            } else {
              dispatch(addStepToRecipe.failure(action.payload.id))
            }
          },
          { args: [Cmd.dispatch] }
        )
      )
    case getType(addStepToRecipe.success):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        steps: recipe.steps.concat(action.payload.step),
        addingStepToRecipe: false
      }))
    case getType(addStepToRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, recipe => ({
        ...recipe,
        addingStepToRecipe: false
      }))
    case getType(addIngredientToRecipe.request):
      return loop(
        mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
          ...recipe,
          addingIngredient: true
        })),
        Cmd.run(
          (dispatch: Dispatch) =>
            api
              .addIngredientToRecipe(
                action.payload.recipeID,
                action.payload.ingredient
              )
              .then(res => {
                if (isOk(res)) {
                  dispatch(
                    addIngredientToRecipe.success({
                      id: action.payload.recipeID,
                      ingredient: res.data
                    })
                  )
                } else {
                  dispatch(
                    addIngredientToRecipe.failure(action.payload.recipeID)
                  )
                }
              }),
          {
            args: [Cmd.dispatch]
          }
        )
      )
    case getType(addIngredientToRecipe.success):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.concat(action.payload.ingredient),
        addingIngredient: false
      }))
    case getType(addIngredientToRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, recipe => ({
        ...recipe,
        addingIngredient: false
      }))
    case getType(deleteIngredient.request):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(x => {
          if (x.id === action.payload.ingredientID) {
            return {
              ...x,
              removing: true
            }
          }
          return x
        })
      }))
    case getType(deleteIngredient.success):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.filter(
          x => x.id !== action.payload.ingredientID
        )
      }))
    case getType(deleteIngredient.failure):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(x => {
          if (x.id === action.payload.ingredientID) {
            return {
              ...x,
              removing: false
            }
          }
          return x
        })
      }))
    case getType(updateIngredient.request): {
      const { recipeID, ingredientID, content } = action.payload
      return loop(
        mapRecipeSuccessById(state, recipeID, recipe => ({
          ...recipe,
          ingredients: recipe.ingredients.map(x => {
            if (x.id === ingredientID) {
              return {
                ...x,
                updating: true
              }
            }
            return x
          })
        })),
        Cmd.run(
          async (dispatch: Dispatch) => {
            const res = await api.updateIngredient(
              recipeID,
              ingredientID,
              content
            )
            if (isOk(res)) {
              dispatch(
                updateIngredient.success({
                  recipeID,
                  ingredientID,
                  content: res.data
                })
              )
            } else {
              dispatch(updateIngredient.failure({ recipeID, ingredientID }))
            }
          },
          { args: [Cmd.dispatch] }
        )
      )
    }
    case getType(updateIngredient.success):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(ingre => {
          if (ingre.id === action.payload.ingredientID) {
            return { ...ingre, ...action.payload.content, updating: false }
          } else {
            return ingre
          }
        })
      }))
    case getType(updateIngredient.failure):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(x => {
          if (x.id === action.payload.ingredientID) {
            return {
              ...x,
              updating: false
            }
          }
          return x
        })
      }))
    case getType(deleteStep.request):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.map(x => {
          if (x.id === action.payload.stepID) {
            return {
              ...x,
              removing: true
            }
          }
          return x
        })
      }))
    case getType(deleteStep.success):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.filter(x => x.id !== action.payload.stepID)
      }))
    case getType(deleteStep.failure):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.map(x => {
          if (x.id === action.payload.stepID) {
            return {
              ...x,
              removing: false
            }
          }
          return x
        })
      }))
    case getType(updateStep.request):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.map(x => {
          if (x.id === action.payload.stepID) {
            return {
              ...x,
              updating: true
            }
          }
          return x
        })
      }))
    case getType(updateStep.success):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.map(s => {
          if (s.id === action.payload.stepID) {
            return {
              ...s,
              text: action.payload.text,
              position: action.payload.position,
              updating: false
            }
          } else {
            return s
          }
        })
      }))
    case getType(updateStep.failure):
      return mapRecipeSuccessById(state, action.payload.recipeID, recipe => ({
        ...recipe,
        steps: recipe.steps.map(x => {
          if (x.id === action.payload.stepID) {
            return {
              ...x,
              updating: false
            }
          }
          return x
        })
      }))

    case getType(updateRecipe.request):
      return loop(
        mapRecipeSuccessById(state, action.payload.id, recipe => ({
          ...recipe,
          updating: true
        })),
        Cmd.run(
          (dispatch: Dispatch) => {
            api
              .updateRecipe(action.payload.id, action.payload.data)
              .then(res => {
                if (isOk(res)) {
                  dispatch(updateRecipe.success(res.data))
                } else {
                  dispatch(updateRecipe.failure(action.payload.id))
                }
              })
          },
          {
            args: [Cmd.dispatch]
          }
        )
      )
    case getType(updateRecipe.success):
      return mapRecipeSuccessById(state, action.payload.id, recipe => ({
        ...recipe,
        ...action.payload,
        updating: false
      }))
    case getType(updateRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, recipe => ({
        ...recipe,
        updating: false
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
