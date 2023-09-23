import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IRecipe, IStep } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

const deleteStep = (recipeID: IRecipe["id"], stepID: IStep["id"]) =>
  http.delete(`/api/v1/recipes/${recipeID}/steps/${stepID}/`)

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
