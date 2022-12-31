import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { addStepToRecipe, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useStepCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
      step,
      position,
    }: {
      recipeId: number
      step: string
      position: string
    }) => addStepToRecipe(recipeId, step, position).then(unwrapResult),
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.steps.push(res)
          })
        },
      )
    },
  })
}
