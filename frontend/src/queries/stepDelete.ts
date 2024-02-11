import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { stepDelete } from "@/api/stepDelete"
import { cacheUpsertRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

export function useStepDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({ stepId }: { recipeId: number; stepId: number }) =>
      stepDelete({ step_id: stepId }),
    onSuccess: (_res, vars) => {
      cacheUpsertRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.steps = recipe.steps.filter((x) => x.id !== vars.stepId)
          })
        },
      })
    },
  })
}
