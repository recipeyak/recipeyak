import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { deleteIngredient, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useIngredientDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
      ingredientId,
    }: {
      recipeId: number
      ingredientId: number
    }) => deleteIngredient(recipeId, ingredientId).then(unwrapResult),
    onSuccess: (_res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.ingredients = recipe.ingredients.filter(
              (x) => x.id !== vars.ingredientId,
            )
          })
        },
      )
    },
  })
}
