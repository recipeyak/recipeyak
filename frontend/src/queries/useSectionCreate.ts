import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { sectionCreate } from "@/api/sectionCreate"
import { cacheUpsertRecipe } from "@/queries/useRecipeFetch"
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
          return produce(prev, (draft) => {
            if (draft == null) {
              return
            }
            draft.sections.push(res)
          })
        },
      })
    },
  })
}
