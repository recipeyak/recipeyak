import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IIngredient, IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

const updateIngredient = (
  recipeID: IRecipe["id"],
  ingredientID: IIngredient["id"],
  content: {
    quantity?: string
    name?: string
    description?: string
    optional?: boolean
    position?: string
  },
) =>
  http.patch<IIngredient>(
    `/api/v1/recipes/${recipeID}/ingredients/${ingredientID}/`,
    content,
  )

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
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
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
      )
    },
  })
}
