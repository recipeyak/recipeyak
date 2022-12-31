import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { addSectionToRecipe, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

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
      addSectionToRecipe({
        recipeId,
        section: payload.title,
        position: payload.position,
      }).then(unwrapResult),
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.sections.push(res)
          })
        },
      )
    },
  })
}
