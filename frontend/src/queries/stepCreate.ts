import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IRecipe, IStep } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

const addStepToRecipe = (
  recipeID: IRecipe["id"],
  step: string,
  position: string,
) =>
  http.post<IStep>(`/api/v1/recipes/${recipeID}/steps/`, {
    text: step,
    position,
  })

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
