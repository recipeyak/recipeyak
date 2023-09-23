import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IIngredient, IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

const addIngredientToRecipe = (recipeID: IRecipe["id"], ingredient: unknown) =>
  http.post<IIngredient>(`/api/v1/recipes/${recipeID}/ingredients/`, ingredient)

export function useIngredientCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
      payload,
    }: {
      recipeId: number
      payload: {
        quantity: string
        name: string
        description: string
        position: string
        optional: boolean
      }
    }) => addIngredientToRecipe(recipeId, payload).then(unwrapResult),
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.ingredients.push(res)
          })
        },
      )
    },
  })
}
