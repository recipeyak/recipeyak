import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const addIngredientToRecipe = (
  recipeID: number,
  ingredient: {
    quantity: string
    name: string
    description: string
    position: string
    optional: boolean
  },
) =>
  http.post<{
    readonly id: number
    readonly quantity: string
    readonly name: string
    readonly description: string
    readonly position: string
    readonly optional: boolean
  }>(`/api/v1/recipes/${recipeID}/ingredients/`, ingredient)

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
