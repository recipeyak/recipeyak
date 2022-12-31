import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { deleteStep, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useStepDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({ recipeId, stepId }: { recipeId: number; stepId: number }) =>
      deleteStep(recipeId, stepId).then(unwrapResult),
    onSuccess: (_res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.steps = recipe.steps.filter((x) => x.id !== vars.stepId)
          })
        },
      )
    },
  })
}
