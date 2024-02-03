import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { ingredientUpdate } from "@/api/ingredientUpdate"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

export function useIngredientUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      ingredientId,
      update,
    }: {
      recipeId: number
      ingredientId: number
      update: {
        name?: string
        quantity?: string
        description?: string
        optional?: boolean
        position?: string
      }
    }) => ingredientUpdate({ ingredient_id: ingredientId, ...update }),
    onSuccess: (res, vars) => {
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.ingredients = recipe.ingredients.map((i) => {
              if (i.id === vars.ingredientId) {
                return res
              }
              return i
            })
          })
        },
      })
    },
  })
}
