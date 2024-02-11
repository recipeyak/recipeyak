import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { sectionCreate } from "@/api/sectionCreate"
import { cacheUpsertRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

export function useSectionCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
      payload,
    }: {
      recipeId: number
      payload: {
        title: string
        position: string
      }
    }) =>
      sectionCreate({
        recipe_id: recipeId,
        position: payload.position,
        title: payload.title,
      }),
    onSuccess: (res, vars) => {
      cacheUpsertRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.sections.push(res)
          })
        },
      })
    },
  })
}
