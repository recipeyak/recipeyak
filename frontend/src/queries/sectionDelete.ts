import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const deleteSection = ({ sectionId }: { readonly sectionId: number }) =>
  http.delete(`/api/v1/sections/${sectionId}/`)

export function useSectionDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    // recipeId to help with cache updates
    mutationFn: ({ sectionId }: { recipeId: number; sectionId: number }) =>
      deleteSection({ sectionId }).then(unwrapResult),
    onSuccess: (_res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
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
