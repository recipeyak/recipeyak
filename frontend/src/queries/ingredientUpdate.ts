import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const updateIngredient = (
  recipeID: number,
  ingredientID: number,
  content: {
    quantity?: string
    name?: string
    description?: string
    optional?: boolean
    position?: string
  },
) =>
  http.patch<{
    readonly id: number
    readonly quantity: string
    readonly name: string
    readonly description: string
    readonly position: string
    readonly optional: boolean
  }>(`/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`, content)

export function useIngredientUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
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
    }) => updateIngredient(recipeId, ingredientId, update).then(unwrapResult),
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
