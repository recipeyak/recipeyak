import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { sectionUpdate } from "@/api/sectionUpdate"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
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
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
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
      })
    },
  })
}
