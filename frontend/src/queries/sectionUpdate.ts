import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { IRecipe, updateSection } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

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
      updateSection({
        sectionId,
        position: update.position,
        title: update.title,
      }).then(unwrapResult),
    onSuccess: (res, vars) => {
      // TODO: might want to update the list view cache
      queryClient.setQueryData(
        [teamId, "recipes", vars.recipeId],
        (prev: IRecipe | undefined): IRecipe | undefined => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.sections = recipe.sections.map((s) => {
              if (s.id === vars.sectionId) {
                return res
              }
              return s
            })
          })
        },
      )
    },
  })
}
