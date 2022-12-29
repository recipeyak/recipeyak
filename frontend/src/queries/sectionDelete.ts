import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { deleteSection, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useSectionDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    // recipeId to help with cache updates
    mutationFn: ({ sectionId }: { recipeId: number; sectionId: number }) =>
      deleteSection({ sectionId }).then(unwrapResult),
    onSuccess: (_res, vars) => {
      // TODO: might want to update the list view cache
      queryClient.setQueryData(
        [teamId, "recipes", vars.recipeId],
        (prev: IRecipe | undefined): IRecipe | undefined => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (r) => {
            r.sections = r.sections.filter((x) => x.id !== vars.sectionId)
          })
        },
      )
    },
  })
}
