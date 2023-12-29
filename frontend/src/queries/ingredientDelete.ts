import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const deleteIngredient = (ingredientID: number) =>
  http.delete(`/api/v1/ingredients/${ingredientID}/`)

export function useIngredientDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      ingredientId,
    }: {
      recipeId: number
      ingredientId: number
    }) => deleteIngredient(ingredientId).then(unwrapResult),
    onSuccess: (_res, vars) => {
      setQueryDataRecipe(queryClient, {
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
