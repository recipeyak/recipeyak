import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, parseISO, startOfWeek, subWeeks } from "date-fns"
import produce from "immer"

import { calendarDelete } from "@/api/calendarDelete"
import {
  cacheUpsertScheduledRecipesWeek,
  ScheduledRecipe,
} from "@/queries/useScheduledRecipeCreate"
import { cacheUpsertScheduledRecipes } from "@/queries/useScheduledRecipeUpdate"
import { useTeamId } from "@/useTeamId"

export function onRecipeDeletion(
  queryClient: QueryClient,
  vars: { teamId: number; scheduledRecipeId: number },
) {
  let deletedCalRecipe: ScheduledRecipe | undefined
  cacheUpsertScheduledRecipes(queryClient, {
    teamId: vars.teamId,
    updater: (prev) => {
      return produce(prev, (draft) => {
        if (draft == null) {
          return
        }
        const deletedCalRecipeIndex = draft.scheduledRecipes.findIndex(
          (x) => x.id === vars.scheduledRecipeId,
        )
        if (deletedCalRecipeIndex !== -1) {
          deletedCalRecipe = draft.scheduledRecipes[deletedCalRecipeIndex]
          draft.scheduledRecipes.splice(deletedCalRecipeIndex, 1)
        }
      })
    },
  })
  return { deletedCalRecipe }
}

export function useScheduledRecipeDelete() {
  const teamId = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ scheduledRecipeId }: { scheduledRecipeId: number }) =>
      calendarDelete({ scheduled_recipe_id: scheduledRecipeId }),
    onMutate: (vars) => {
      return onRecipeDeletion(queryClient, {
        scheduledRecipeId: vars.scheduledRecipeId,
        teamId,
      })
    },
    onError: (_err, _vars, context) => {
      const deletedCalRecipe = context?.deletedCalRecipe
      if (deletedCalRecipe == null) {
        return
      }

      const initialWeekId = startOfWeek(parseISO(deletedCalRecipe.on))
      const weekIds = [
        subWeeks(initialWeekId, 2),
        subWeeks(initialWeekId, 1),
        initialWeekId,
        addWeeks(initialWeekId, 1),
        addWeeks(initialWeekId, 2),
      ]
      weekIds.forEach((weekId) => {
        cacheUpsertScheduledRecipesWeek(queryClient, {
          teamId,
          weekId,
          updater: (prev) => {
            return produce(prev, (draft) => {
              draft?.scheduledRecipes.push(deletedCalRecipe)
            })
          },
        })
      })
    },
  })
}
