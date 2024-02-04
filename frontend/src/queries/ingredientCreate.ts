import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { ingredientCreate } from "@/api/ingredientCreate"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

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
    }) =>
      ingredientCreate({
        quantity: payload.quantity,
        name: payload.name,
        description: payload.description,
        position: payload.position,
        optional: payload.optional,
        recipe_id: recipeId,
      }),
    onSuccess: (res, vars) => {
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.ingredients.push(res)
          })
        },
      })
    },
  })
}
