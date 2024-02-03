import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { sectionDelete } from "@/api/sectionDelete"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

export function useSectionDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    // recipeId to help with cache updates
    mutationFn: ({ sectionId }: { recipeId: number; sectionId: number }) =>
      sectionDelete({ section_id: sectionId }),
    onSuccess: (_res, vars) => {
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (r) => {
            r.sections = r.sections.filter((x) => x.id !== vars.sectionId)
          })
        },
      })
    },
  })
}
