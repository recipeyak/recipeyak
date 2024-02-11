import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { ingredientDelete } from "@/api/ingredientDelete"
import { cacheUpsertRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

export function useIngredientDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      ingredientId,
    }: {
      recipeId: number
      ingredientId: number
    }) => ingredientDelete({ ingredient_id: ingredientId }),
    onSuccess: (_res, vars) => {
      cacheUpsertRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.ingredients = recipe.ingredients.filter(
              (x) => x.id !== vars.ingredientId,
            )
          })
        },
      })
    },
  })
}
