import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { addIngredientToRecipe, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

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
      }
    }) => addIngredientToRecipe(recipeId, payload).then(unwrapResult),
    onSuccess: (res, vars) => {
      // TODO: might want to update the list view cache
      queryClient.setQueryData(
        [teamId, "recipes", vars.recipeId],
        (prev: IRecipe | undefined): IRecipe | undefined => {
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