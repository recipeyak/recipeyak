import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

// TODO(sbdchd): this shouldn't require recipeID
const updateStep = (
  recipeID: number,
  stepID: number,
  data: {
    readonly text?: string
    readonly position?: string
  },
) =>
  http.patch<{
    readonly id: number
    readonly text: string
    readonly position: string
  }>(`/api/v1/recipes/${recipeID}/steps/${stepID}/`, data)

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
        setQueryDataRecipe(queryClient, {
          teamId,
          recipeId: vars.recipeId,
          updater: (prev) => {
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
        })
      }
      return { oldPosition }
    },
    onSuccess: (res, vars) => {
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
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
      })
    },
    onError: (_error, vars, context) => {
      if (vars.update.position !== undefined && context?.oldPosition != null) {
        const oldPos = context?.oldPosition
        setQueryDataRecipe(queryClient, {
          teamId,
          recipeId: vars.recipeId,
          updater: (prev) => {
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
        })
      }
    },
  })
}
