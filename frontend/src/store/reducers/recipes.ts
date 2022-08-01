import omit from "lodash/omit"
import omitBy from "lodash/omitBy"
import { ITeam } from "@/store/reducers/teams"
import * as api from "@/api"
import {
  createAsyncAction,
  ActionType,
  getType,
  createStandardAction,
} from "typesafe-actions"
import { IState } from "@/store/store"
import {
  WebData,
  HttpErrorKind,
  Success,
  Failure,
  isSuccessOrRefetching,
  mapSuccessLike,
  toLoading,
} from "@/webdata"
import { isOk } from "@/result"
import { Loop, loop, Cmd } from "redux-loop"
import {
  Dispatch,
  updatingStepAsync,
  deletingStepAsync,
  deletingIngredientAsync,
} from "@/store/thunks"
import { push } from "connected-react-router"
import { recipeURL } from "@/urls"

export const updateRecipeOwner = createStandardAction("UPDATE_RECIPE_OWNER")<{
  id: IRecipe["id"]
  owner: IRecipe["owner"]
}>()

export const deleteRecipe = createAsyncAction(
  "DELETE_RECIPE_START",
  "DELETE_RECIPE_SUCCESS",
  "DELETE_RECIPE_FAILURE",
)<IRecipe["id"], IRecipe["id"], IRecipe["id"]>()

async function deletingRecipeAsync(
  recipeID: IRecipe["id"],
  dispatch: Dispatch,
) {
  const res = await api.deleteRecipe(recipeID)
  if (isOk(res)) {
    dispatch(push("/recipes"))
    dispatch(deleteRecipe.success(recipeID))
  } else {
    dispatch(deleteRecipe.failure(recipeID))
  }
}

export const fetchRecipe = createAsyncAction(
  "FETCH_RECIPE_START",
  "FETCH_RECIPE_SUCCESS",
  "FETCH_RECIPE_FAILURE",
)<
  { recipeId: IRecipe["id"]; refresh?: boolean },
  IRecipe,
  { id: IRecipe["id"]; error404: boolean }
>()

async function fetchingRecipeAsync(
  args: { recipeId: IRecipe["id"]; refresh?: boolean },
  dispatch: Dispatch,
) {
  const res = await api.getRecipe(args.recipeId)
  if (isOk(res)) {
    dispatch(fetchRecipe.success(res.data))
  } else {
    // If we have an error when refreshing, we shouldn't raise an error.
    if (args.refresh) {
      return
    }
    // HACK: edge case where inflight network request is cancelled as we start
    // navigating to a new site.
    if (res.error.message === "Network Error") {
      return
    }
    const error404 = !!(res.error.response && res.error.response.status === 404)
    dispatch(
      fetchRecipe.failure({
        id: args.recipeId,
        error404,
      }),
    )
  }
}

export const fetchRecipeList = createAsyncAction(
  "FETCH_RECIPE_LIST_START",
  "FETCH_RECIPE_LIST_SUCCESS",
  "FETCH_RECIPE_LIST_FAILURE",
)<void, { recipes: IRecipe[] }, void>()

export interface IAddRecipeError {
  readonly errorWithName?: boolean
}

export const createRecipe = createAsyncAction(
  "CREATE_RECIPE_START",
  "CREATE_RECIPE_SUCCESS",
  "CREATE_RECIPE_FAILURE",
)<void, IRecipe, IAddRecipeError>()

export const resetAddRecipeErrors = createStandardAction(
  "RESET_CREATE_RECIPE_ERRORS",
)()

export const deleteStep = createAsyncAction(
  "DELETE_STEP_REQUEST",
  "DELETE_STEP_SUCCESS",
  "DELETE_STEP_FAILURE",
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
  "UPDATING_STEP_FAILURE",
)<
  {
    recipeID: IRecipe["id"]
    stepID: IStep["id"]
    text?: IStep["text"]
    position?: IStep["position"]
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
  "DELETE_INGREDIENT_FAILURE",
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

interface IUpdateIngredientArg {
  recipeID: IRecipe["id"]
  ingredientID: IIngredient["id"]
  content: Partial<Omit<IIngredient, "id">>
}

export const updateIngredient = createAsyncAction(
  "UPDATE_INGREDIENT_REQUEST",
  "UPDATE_INGREDIENT_SUCCESS",
  "UPDATE_INGREDIENT_FAILURE",
)<
  IUpdateIngredientArg,
  {
    recipeID: IRecipe["id"]
    ingredientID: IIngredient["id"]
    content: IIngredient
  },
  { recipeID: IRecipe["id"]; ingredientID: IIngredient["id"] }
>()

async function updatingIngredientAsync(
  payload: IUpdateIngredientArg,
  dispatch: Dispatch,
) {
  const { recipeID, ingredientID, content } = payload
  const res = await api.updateIngredient(recipeID, ingredientID, content)
  if (isOk(res)) {
    dispatch(
      updateIngredient.success({
        recipeID,
        ingredientID,
        content: res.data,
      }),
    )
  } else {
    dispatch(updateIngredient.failure({ recipeID, ingredientID }))
  }
}

interface IUpdateRecipeRequestArg {
  readonly id: IRecipe["id"]
  readonly data: Partial<Omit<IRecipe, "id">>
}

export const updateRecipe = createAsyncAction(
  "UPDATE_RECIPE_REQUEST",
  "UPDATE_RECIPE_SUCCESS",
  "UPDATE_RECIPE_FAILIURE",
)<IUpdateRecipeRequestArg, IRecipe, IRecipe["id"]>()

export async function updatingRecipeAsync(
  payload: IUpdateRecipeRequestArg,
  dispatch: Dispatch,
) {
  const res = await api.updateRecipe(payload.id, payload.data)
  if (isOk(res)) {
    dispatch(updateRecipe.success(res.data))
  } else {
    dispatch(updateRecipe.failure(payload.id))
  }
}

interface IAddStepToRecipeArg {
  readonly id: IRecipe["id"]
  readonly step: IStep["text"] | undefined
}

export const addStepToRecipe = createAsyncAction(
  "ADD_STEP_TO_RECIPE_REQUEST",
  "ADD_STEP_TO_RECIPE_SUCCESS",
  "ADD_STEP_TO_RECIPE_FAILURE",
)<
  IAddStepToRecipeArg,
  {
    id: IRecipe["id"]
    step: IStep
  },
  IRecipe["id"]
>()

async function addingStepToRecipeAsync(
  payload: IAddStepToRecipeArg,
  dispatch: Dispatch,
) {
  const res = await api.addStepToRecipe(payload.id, payload.step)
  if (isOk(res)) {
    dispatch(
      addStepToRecipe.success({
        id: payload.id,
        step: res.data,
      }),
    )
  } else {
    dispatch(addStepToRecipe.failure(payload.id))
  }
}

interface IAddIngredientToRecipeArg {
  readonly recipeID: IRecipe["id"]
  // TODO(sbdchd): this type should be more specific
  readonly ingredient: Partial<Omit<IIngredient, "id">>
}

export const addIngredientToRecipe = createAsyncAction(
  "ADD_INGREDIENT_TO_RECIPE_REQUEST",
  "ADD_INGREDIENT_TO_RECIPE_SUCCESS",
  "ADD_INGREDIENT_TO_RECIPE_FAILURE",
)<
  IAddIngredientToRecipeArg,
  {
    id: IRecipe["id"]
    ingredient: IIngredient
  },
  IRecipe["id"]
>()

async function addingIngredientToRecipeAsync(
  payload: IAddIngredientToRecipeArg,
  dispatch: Dispatch,
) {
  const res = await api.addIngredientToRecipe(
    payload.recipeID,
    payload.ingredient,
  )

  if (isOk(res)) {
    dispatch(
      addIngredientToRecipe.success({
        id: payload.recipeID,
        ingredient: res.data,
      }),
    )
  } else {
    dispatch(addIngredientToRecipe.failure(payload.recipeID))
  }
}

export const addSectionToRecipe = createStandardAction(
  "ADD_SECTION_TO_RECIPE",
)<{
  readonly recipeId: number
  readonly section: {
    readonly title: string
    readonly position: number
    readonly id: number
  }
}>()

export const removeSectionFromRecipe = createStandardAction(
  "REMOVE_SECTION_FROM_RECIPE",
)<{
  readonly recipeId: number
  readonly sectionId: number
}>()
export const updateSectionForRecipe = createStandardAction(
  "UPDATE_SECTION_FOR_RECIPE",
)<{
  readonly recipeId: number
  readonly sectionId: number
  readonly title?: string
  readonly position?: number
}>()

export const setSchedulingRecipe = createStandardAction(
  "SET_SCHEDULING_RECIPE",
)<{
  recipeID: IRecipe["id"]
  scheduling: boolean
}>()

export const toggleEditingRecipe = createStandardAction(
  "TOGGLE_RECIPE_EDITING",
)<IRecipe["id"]>()

export const setRecipeStepDraft = createStandardAction(
  "SET_RECIPE_STEP_DRAFT",
)<{ id: IRecipe["id"]; draftStep: IRecipe["draftStep"] }>()

export const duplicateRecipe = createAsyncAction(
  "DUPLICATE_RECIPE/REQUEST",
  "DUPLICATE_RECIPE/SUCCESS",
  "DUPLICATE_RECIPE/FAILURE",
)<
  { readonly recipeId: IRecipe["id"]; readonly onComplete?: () => void },
  { readonly recipe: IRecipe; readonly originalRecipeId: IRecipe["id"] },
  number
>()

export const patchRecipe = createStandardAction("PATCH_RECIPE")<{
  recipeId: IRecipe["id"]
  updateFn: (x: IRecipe) => IRecipe
}>()

interface IDuplicateRecipeAsync {
  readonly recipeId: number
}

export async function duplicateRecipeAsync(
  { recipeId }: IDuplicateRecipeAsync,
  dispatch: Dispatch,
  cb?: () => void,
) {
  const res = await api.duplicateRecipe(recipeId)

  if (isOk(res)) {
    dispatch(
      duplicateRecipe.success({ recipe: res.data, originalRecipeId: recipeId }),
    )
    dispatch(push(recipeURL(res.data.id)))
  } else {
    dispatch(duplicateRecipe.failure(recipeId))
  }
  cb?.()
}

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
    | "created"
    | "archived_at"
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
  | ActionType<typeof resetAddRecipeErrors>
  | ActionType<typeof toggleEditingRecipe>
  | ActionType<typeof setRecipeStepDraft>
  | ActionType<typeof duplicateRecipe>
  | ActionType<typeof patchRecipe>
  | ActionType<typeof addSectionToRecipe>
  | ActionType<typeof removeSectionFromRecipe>
  | ActionType<typeof updateSectionForRecipe>

const mapSuccessLikeById = <T extends IRecipe["id"][]>(
  arr: WebData<T>,
  state: IState,
): WebData<IRecipe[]> =>
  mapSuccessLike(arr, (a) =>
    a
      .map((id) => getRecipeById(state, id))
      .filter(isSuccessOrRefetching)
      .map((d) => d.data),
  )

export function getTeamRecipes(
  state: IState,
  teamID: number | "personal",
): WebData<IRecipe[]> {
  const ids =
    teamID === "personal"
      ? state.recipes.personalIDs
      : state.recipes.teamIDs[teamID]
  return mapSuccessLikeById(ids, state)
}

export const getRecipeById = (
  state: Pick<IState, "recipes">,
  id: IRecipe["id"],
): WebData<IRecipe> => state.recipes.byId[id]

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

export interface IPublicUser {
  readonly id: string
  readonly name: string | null
  readonly avatar_url: string
}

export interface INote {
  readonly id: number
  readonly type: "note"
  readonly text: string
  readonly modified: string
  readonly created: string
  readonly last_modified_by: IPublicUser
  readonly created_by: IPublicUser
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

export type RecipeTimelineItem = {
  type: "recipe"
  id: number
  action: "created" | "archived" | "unarchived" | "deleted"
  created_by: IPublicUser | null
  created: string
}

export type TimelineItem = INote | RecipeTimelineItem

export interface IRecipe {
  readonly id: number
  readonly name: string
  readonly author: string
  readonly source: string
  readonly time: string
  readonly servings: string
  readonly steps: ReadonlyArray<IStep>
  readonly edits: ReadonlyArray<unknown>
  readonly timelineItems: readonly TimelineItem[]
  readonly modified: string
  readonly last_scheduled: string
  readonly team: ITeam["id"]
  readonly tags?: string[]
  readonly owner: IRecipeOwner
  readonly ingredients: ReadonlyArray<IIngredient>
  readonly sections: ReadonlyArray<{
    readonly id: number
    readonly title: string
    readonly position: number
  }>
  readonly created: string
  readonly archived_at: string | null

  readonly editing?: boolean
  readonly deleting?: boolean
  readonly addingStepToRecipe?: boolean
  readonly addingIngredient?: boolean
  readonly scheduling?: boolean
  readonly updating?: boolean
  readonly draftStep?: string
}

function mapRecipeSuccessById(
  state: IRecipesState,
  id: IRecipe["id"],
  func: (recipe: IRecipe) => IRecipe,
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
        data: func(recipe.data),
      },
    },
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
  readonly duplicatingById: {
    readonly [key: number]: boolean | undefined
  }
}

export const initialState: IRecipesState = {
  creatingRecipe: false,
  errorCreatingRecipe: {},
  byId: {},
  duplicatingById: {},
  personalIDs: undefined,
  teamIDs: {},
}

export const recipes = (
  state: IRecipesState = initialState,
  action: RecipeActions,
): IRecipesState | Loop<IRecipesState, RecipeActions> => {
  switch (action.type) {
    case getType(fetchRecipe.request): {
      const r = state.byId[action.payload.recipeId]
      return loop(
        {
          ...state,
          byId: {
            ...state.byId,
            [action.payload.recipeId]: !action.payload.refresh
              ? toLoading(r)
              : r,
          },
        },
        Cmd.run(fetchingRecipeAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    }
    case getType(fetchRecipe.success):
      const originalRecipe = state.byId[action.payload.id]

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: Success({
            ...(isSuccessOrRefetching(originalRecipe)
              ? originalRecipe.data
              : {}),
            ...action.payload,
          }),
        },
      }
    case getType(fetchRecipe.failure): {
      const failure = action.payload.error404
        ? HttpErrorKind.error404
        : HttpErrorKind.other
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: Failure(failure),
        },
      }
    }
    case getType(patchRecipe): {
      return mapRecipeSuccessById(state, action.payload.recipeId, (recipe) =>
        action.payload.updateFn(recipe),
      )
    }
    case getType(toggleEditingRecipe):
      return mapRecipeSuccessById(state, action.payload, (recipe) => ({
        ...recipe,
        editing: !recipe.editing,
      }))

    case getType(setRecipeStepDraft):
      return mapRecipeSuccessById(state, action.payload.id, (recipe) => ({
        ...recipe,
        draftStep: action.payload.draftStep,
      }))

    case getType(fetchRecipeList.request): {
      return {
        ...state,
        personalIDs: toLoading(state.personalIDs),
      }
    }
    case getType(fetchRecipeList.success): {
      const newIds = action.payload.recipes.map((r) => r.id)

      const newState = {
        ...state,
        byId: action.payload.recipes.reduce(
          (a, b) => ({
            ...a,
            [b.id]: Success(b),
          }),
          state.byId,
        ),
      }

      return { ...newState, personalIDs: Success(newIds) }
    }
    case getType(fetchRecipeList.failure): {
      return {
        ...state,
        personalIDs: Failure(HttpErrorKind.other),
      }
    }
    case getType(createRecipe.request):
      return {
        ...state,
        creatingRecipe: true,
        errorCreatingRecipe: {},
      }
    case getType(createRecipe.success):
      return {
        ...state,
        creatingRecipe: false,
        errorCreatingRecipe: {},
        byId: {
          ...state.byId,
          [action.payload.id]: Success(action.payload),
        },
      }
    case getType(createRecipe.failure):
      return {
        ...state,
        creatingRecipe: false,
        errorCreatingRecipe: action.payload,
      }
    case getType(resetAddRecipeErrors):
      return {
        ...state,
        errorCreatingRecipe: {},
      }
    case getType(deleteRecipe.request):
      return loop(
        mapRecipeSuccessById(state, action.payload, (recipe) => ({
          ...recipe,
          deleting: true,
        })),
        Cmd.run(deletingRecipeAsync, { args: [action.payload, Cmd.dispatch] }),
      )
    case getType(deleteRecipe.success):
      return {
        ...state,
        byId: omit(state.byId, action.payload),
        personalIDs: mapSuccessLike(state.personalIDs, (ids) =>
          ids.filter((id) => id !== action.payload),
        ),
        teamIDs: Object.entries(state.teamIDs).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: mapSuccessLike(value, (v) =>
              v.filter((id) => id !== action.payload),
            ),
          }),
          {},
        ),
      }
    case getType(deleteRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, (recipe) => ({
        ...recipe,
        deleting: false,
      }))

    case getType(addStepToRecipe.request):
      return loop(
        mapRecipeSuccessById(state, action.payload.id, (recipe) => ({
          ...recipe,
          addingStepToRecipe: true,
        })),
        Cmd.run(addingStepToRecipeAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    case getType(addStepToRecipe.success):
      return mapRecipeSuccessById(state, action.payload.id, (recipe) => ({
        ...recipe,
        steps: recipe.steps.concat(action.payload.step),
        addingStepToRecipe: false,
        draftStep: "",
      }))
    case getType(addStepToRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, (recipe) => ({
        ...recipe,
        addingStepToRecipe: false,
      }))
    case getType(addIngredientToRecipe.request):
      return loop(
        mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
          ...recipe,
          addingIngredient: true,
        })),
        Cmd.run(addingIngredientToRecipeAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    case getType(addSectionToRecipe):
      return mapRecipeSuccessById(state, action.payload.recipeId, (recipe) => {
        const sections = recipe.sections.concat(action.payload.section)
        return {
          ...recipe,
          sections,
        }
      })
    case getType(removeSectionFromRecipe):
      return mapRecipeSuccessById(state, action.payload.recipeId, (recipe) => {
        if (recipe.sections == null) {
          return recipe
        }
        const sections = recipe.sections.filter(
          (x) => x.id !== action.payload.sectionId,
        )
        return {
          ...recipe,
          sections,
        }
      })
    case getType(updateSectionForRecipe):
      return mapRecipeSuccessById(state, action.payload.recipeId, (recipe) => {
        if (recipe.sections == null) {
          return recipe
        }
        const sections = recipe.sections.map((s) => {
          if (s.id === action.payload.sectionId) {
            return { ...s, ...omitBy(action.payload, (x) => x == null) }
          }
          return s
        })
        return {
          ...recipe,
          sections,
        }
      })
    case getType(addIngredientToRecipe.success):
      return mapRecipeSuccessById(state, action.payload.id, (recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients.concat(action.payload.ingredient),
        addingIngredient: false,
      }))
    case getType(addIngredientToRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, (recipe) => ({
        ...recipe,
        addingIngredient: false,
      }))
    case getType(deleteIngredient.request):
      return loop(
        mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
          ...recipe,
          ingredients: recipe.ingredients.map((x) => {
            if (x.id === action.payload.ingredientID) {
              return {
                ...x,
                removing: true,
              }
            }
            return x
          }),
        })),
        Cmd.run(deletingIngredientAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    case getType(deleteIngredient.success):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients.filter(
          (x) => x.id !== action.payload.ingredientID,
        ),
      }))
    case getType(deleteIngredient.failure):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients.map((x) => {
          if (x.id === action.payload.ingredientID) {
            return {
              ...x,
              removing: false,
            }
          }
          return x
        }),
      }))
    case getType(updateIngredient.request): {
      return loop(
        mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
          ...recipe,
          ingredients: recipe.ingredients.map((x) => {
            if (x.id === action.payload.ingredientID) {
              return {
                ...x,
                updating: true,
                position: action.payload.content.position ?? x.position,
              }
            }
            return x
          }),
        })),
        Cmd.run(updatingIngredientAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    }
    case getType(updateIngredient.success):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients.map((ingre) => {
          if (ingre.id === action.payload.ingredientID) {
            return { ...ingre, ...action.payload.content, updating: false }
          }
          return ingre
        }),
      }))
    case getType(updateIngredient.failure):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients.map((x) => {
          if (x.id === action.payload.ingredientID) {
            return {
              ...x,
              updating: false,
            }
          }
          return x
        }),
      }))
    case getType(deleteStep.request):
      return loop(
        mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
          ...recipe,
          steps: recipe.steps.map((x) => {
            if (x.id === action.payload.stepID) {
              return {
                ...x,
                removing: true,
              }
            }
            return x
          }),
        })),
        Cmd.run(deletingStepAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    case getType(deleteStep.success):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        steps: recipe.steps.filter((x) => x.id !== action.payload.stepID),
      }))
    case getType(deleteStep.failure):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        steps: recipe.steps.map((x) => {
          if (x.id === action.payload.stepID) {
            return {
              ...x,
              removing: false,
            }
          }
          return x
        }),
      }))
    case getType(updateStep.request): {
      return loop(
        mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
          ...recipe,
          steps: recipe.steps.map((x) => {
            if (x.id === action.payload.stepID) {
              return {
                ...x,
                text: action.payload.text || x.text,
                position: action.payload.position || x.position,
                updating: true,
              }
            }
            return x
          }),
        })),
        Cmd.run(updatingStepAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    }

    case getType(updateStep.success):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        steps: recipe.steps.map((s) => {
          if (s.id === action.payload.stepID) {
            return {
              ...s,
              text: action.payload.text,
              position: action.payload.position,
              updating: false,
            }
          }
          return s
        }),
      }))
    case getType(updateStep.failure):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        steps: recipe.steps.map((x) => {
          if (x.id === action.payload.stepID) {
            return {
              ...x,
              updating: false,
            }
          }
          return x
        }),
      }))

    case getType(updateRecipe.request):
      return loop(
        mapRecipeSuccessById(state, action.payload.id, (recipe) => ({
          ...recipe,
          tags:
            action.payload.data.tags !== undefined
              ? action.payload.data.tags
              : recipe.tags,
          updating: true,
        })),
        Cmd.run(updatingRecipeAsync, {
          args: [action.payload, Cmd.dispatch],
        }),
      )
    case getType(updateRecipe.success):
      return mapRecipeSuccessById(state, action.payload.id, (recipe) => ({
        ...recipe,
        ...action.payload,
        updating: false,
        editing: false,
      }))
    case getType(updateRecipe.failure):
      return mapRecipeSuccessById(state, action.payload, (recipe) => ({
        ...recipe,
        updating: false,
      }))
    case getType(updateRecipeOwner):
      return mapRecipeSuccessById(state, action.payload.id, (recipe) => ({
        ...recipe,

        owner: action.payload.owner,
      }))
    case getType(setSchedulingRecipe):
      return mapRecipeSuccessById(state, action.payload.recipeID, (recipe) => ({
        ...recipe,
        scheduling: action.payload.scheduling,
      }))
    case getType(duplicateRecipe.request): {
      const { recipeId, onComplete } = action.payload
      return loop(
        {
          ...state,
          duplicatingById: {
            ...state.duplicatingById,
            [recipeId]: true,
          },
        },
        Cmd.run(duplicateRecipeAsync, {
          args: [{ recipeId }, Cmd.dispatch, onComplete],
        }),
      )
    }
    case getType(duplicateRecipe.success):
      return {
        ...state,
        duplicatingById: {
          ...state.duplicatingById,
          [action.payload.originalRecipeId]: false,
        },
        byId: {
          ...state.byId,
          [action.payload.recipe.id]: Success(action.payload.recipe),
        },
      }

    case getType(duplicateRecipe.failure):
      return {
        ...state,
        duplicatingById: {
          ...state.duplicatingById,
          [action.payload]: false,
        },
      }
    default:
      return state
  }
}

export default recipes
