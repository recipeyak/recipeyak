import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { sectionUpdate } from "@/api/sectionUpdate"
import { cacheUpsertRecipe } from "@/queries/useRecipeFetch"
import { useTeamId } from "@/useTeamId"

export function useSectionUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      sectionId,
      update,
    }: {
      // recipe id so we can update cache
      recipeId: number
      sectionId: number
      update: {
        title?: string
        position?: string
      }
    }) =>
      sectionUpdate({
        position: update.position,
        title: update.title,
        section_id: sectionId,
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
            const indexToUpdate = draft.sections.findIndex(
              (x) => x.id === vars.sectionId,
            )
            draft.sections[indexToUpdate] = res
          })
        },
      })
    },
  })
}
