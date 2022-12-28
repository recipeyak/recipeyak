// eslint-disable-next-line no-restricted-imports
import { Dispatch as ReduxDispatch } from "redux"

import * as api from "@/api"
import { isOk } from "@/result"
import {
  deleteIngredient,
  deleteStep,
  fetchRecipeList,
  IIngredient,
  IRecipe,
  IStep,
  updateStep,
} from "@/store/reducers/recipes"
import { Action } from "@/store/store"

// TODO(sbdchd): move to @/store/store
export type Dispatch = ReduxDispatch<Action>

export const fetchingRecipeListAsync = (dispatch: Dispatch) => async () => {
  dispatch(fetchRecipeList.request())
  const res = await api.getRecipeList()
  if (isOk(res)) {
    dispatch(fetchRecipeList.success({ recipes: res.data }))
  } else {
    dispatch(fetchRecipeList.failure())
  }
}

interface IDeletingIngredientAsyncPayload {
  readonly recipeID: IRecipe["id"]
  readonly ingredientID: IIngredient["id"]
}

export async function deletingIngredientAsync(
  { recipeID, ingredientID }: IDeletingIngredientAsyncPayload,
  dispatch: Dispatch,
) {
  const res = await api.deleteIngredient(recipeID, ingredientID)
  if (isOk(res)) {
    dispatch(deleteIngredient.success({ recipeID, ingredientID }))
  } else {
    dispatch(deleteIngredient.failure({ recipeID, ingredientID }))
  }
}

interface IUpdatingStepPayload {
  readonly recipeID: IRecipe["id"]
  readonly stepID: IStep["id"]
  readonly text?: string
  readonly position?: string
}

export const updatingStepAsync = async (
  { recipeID, stepID, ...data }: IUpdatingStepPayload,
  dispatch: Dispatch,
) => {
  const res = await api.updateStep(recipeID, stepID, data)
  if (isOk(res)) {
    dispatch(
      updateStep.success({
        recipeID,
        stepID,
        text: res.data.text,
        position: res.data.position,
      }),
    )
  } else {
    dispatch(updateStep.failure({ recipeID, stepID }))
  }
}

interface IDeletingStepPayload {
  readonly recipeID: IRecipe["id"]
  readonly stepID: IStep["id"]
}
export const deletingStepAsync = async (
  { recipeID, stepID }: IDeletingStepPayload,
  dispatch: Dispatch,
) => {
  const res = await api.deleteStep(recipeID, stepID)
  if (isOk(res)) {
    dispatch(deleteStep.success({ recipeID, stepID }))
  } else {
    dispatch(deleteStep.failure({ recipeID, stepID }))
  }
}
