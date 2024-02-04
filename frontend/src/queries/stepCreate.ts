import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { stepCreate } from "@/api/stepCreate"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

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
    }) => stepCreate({ text: step, position, recipe_id: recipeId }),
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
