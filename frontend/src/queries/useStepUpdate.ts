import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { stepUpdate } from "@/api/stepUpdate"
import { cacheUpsertRecipe } from "@/queries/useRecipeFetch"
import { useTeamId } from "@/useTeamId"

export function useStepUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      stepId,
      update,
    }: {
      recipeId: number
      stepId: number
      update: {
        text?: string
        position?: string
      }
    }) =>
      stepUpdate({
        step_id: stepId,
        position: update.position,
        text: update.text,
      }),
    onMutate: (vars) => {
      let oldPosition: string | undefined
      if (vars.update.position !== undefined) {
        const newPosition = vars.update.position
        cacheUpsertRecipe(queryClient, {
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
      cacheUpsertRecipe(queryClient, {
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
        cacheUpsertRecipe(queryClient, {
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
