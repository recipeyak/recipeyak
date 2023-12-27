import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const addStepToRecipe = (recipeID: number, step: string, position: string) =>
  http.post<{
    readonly id: number
    readonly text: string
    readonly position: string
  }>(`/api/v1/recipes/${recipeID}/steps/`, {
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
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.steps.push(res)
          })
        },
      })
    },
  })
}
