import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IRecipe, IStep } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

interface IUpdateStepPayload {
  readonly text?: string
  readonly position?: string
}

// TODO(sbdchd): this shouldn't require recipeID
const updateStep = (
  recipeID: IRecipe["id"],
  stepID: IStep["id"],
  data: IUpdateStepPayload,
) => http.patch<IStep>(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, data)

export function useStepUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
      stepId,
      update,
    }: {
      recipeId: number
      stepId: number
      update: {
        text?: string
        position?: string
      }
    }) => updateStep(recipeId, stepId, update).then(unwrapResult),
    onMutate: (vars) => {
      let oldPosition: string | undefined
      if (vars.update.position !== undefined) {
        const newPosition = vars.update.position

        queryClient.setQueryData<IRecipe>(
          [teamId, "recipes", vars.recipeId],
          (prev) => {
            if (prev == null) {
              return prev
            }
            return produce(prev, (recipe) => {
              recipe.steps.forEach((s) => {
                if (s.id === vars.stepId) {
                  oldPosition = s.position
                  s.position = newPosition
                }
              })
            })
          },
        )
      }
      return { oldPosition }
    },
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return produce(prev, (recipe) => {
            recipe.steps = recipe.steps.map((s) => {
              if (s.id === res.id) {
                return res
              }
              return s
            })
          })
        },
      )
    },
    onError: (_error, vars, context) => {
      if (vars.update.position !== undefined && context?.oldPosition != null) {
        const oldPos = context?.oldPosition

        queryClient.setQueryData<IRecipe>(
          [teamId, "recipes", vars.recipeId],
          (prev) => {
            if (prev == null) {
              return prev
            }
            return produce(prev, (recipe) => {
              recipe.steps.forEach((s) => {
                if (s.id === vars.stepId) {
                  s.position = oldPos
                }
              })
            })
          },
        )
      }
    },
  })
}
