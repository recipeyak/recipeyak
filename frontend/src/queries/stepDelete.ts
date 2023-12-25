import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const deleteStep = (recipeID: number, stepID: number) =>
  http.delete(`/api/v1/recipes/${recipeID}/steps/${stepID}/`)

export function useStepDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({ recipeId, stepId }: { recipeId: number; stepId: number }) =>
      deleteStep(recipeId, stepId).then(unwrapResult),
    onSuccess: (_res, vars) => {
      setQueryDataRecipe(queryClient, {
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
