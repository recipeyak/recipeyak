import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { sectionDelete } from "@/api/sectionDelete"
import { cacheUpsertRecipe } from "@/queries/useRecipeFetch"
import { useTeamId } from "@/useTeamId"

export function useSectionDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    // recipeId to help with cache updates
    mutationFn: ({ sectionId }: { recipeId: number; sectionId: number }) =>
      sectionDelete({ section_id: sectionId }),
    onSuccess: (_res, vars) => {
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
            draft.sections.splice(indexToUpdate, 1)
          })
        },
      })
    },
  })
}
