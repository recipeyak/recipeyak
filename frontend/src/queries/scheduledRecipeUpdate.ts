import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { calendarUpdate } from "@/api/calendarUpdate"
import { toISODateString } from "@/date"
import {
  CalendarResponse,
  ScheduledRecipe,
} from "@/queries/scheduledRecipeCreate"
import { useTeamId } from "@/useTeamId"

export function onScheduledRecipeUpdateSuccess(params: {
  queryClient: QueryClient
  teamID: number
  scheduledRecipeId: number
  updatedCalRecipe: ScheduledRecipe
}) {
  cacheUpsertScheduledRecipes(params.queryClient, {
    teamId: params.teamID,
    updater: (prev) => {
      return produce(prev, (draft) => {
        if (draft == null) {
          return
        }
        const index = draft.scheduledRecipes.findIndex(
          (calRecipe) => calRecipe.id === params.scheduledRecipeId,
        )
        if (index !== -1) {
          draft.scheduledRecipes[index] = params.updatedCalRecipe
        }
      })
    },
  })
}

export function useScheduledRecipeUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      scheduledRecipeId,
      update,
    }: {
      scheduledRecipeId: number
      update: {
        on: Date
      }
    }) => {
      return calendarUpdate({
        on: toISODateString(update.on),
        scheduled_recipe_id: scheduledRecipeId,
      })
    },
    onMutate: (vars) => {
      let previousOn: string | undefined
      cacheUpsertScheduledRecipes(queryClient, {
        teamId,
        updater: (prev) => {
          return produce(prev, (draft) => {
            if (draft == null) {
              return
            }
            for (const calRecipe of draft.scheduledRecipes) {
              if (calRecipe.id === vars.scheduledRecipeId) {
                previousOn = calRecipe.on
                calRecipe.on = toISODateString(vars.update.on)
                break
              }
            }
          })
        },
      })
      return {
        optimisticScheduledRecipeId: vars.scheduledRecipeId,
        previousOn,
      }
    },
    onSuccess: (response, vars) => {
      onScheduledRecipeUpdateSuccess({
        queryClient,
        teamID: teamId,
        scheduledRecipeId: vars.scheduledRecipeId,
        updatedCalRecipe: response,
      })
    },
    onError: (__err, vars, context) => {
      if (context == null) {
        return
      }
      cacheUpsertScheduledRecipes(queryClient, {
        teamId,
        updater: (prev) => {
          return produce(prev, (draft) => {
            if (draft == null) {
              return
            }
            if (context.previousOn == null) {
              return
            }
            for (const calRecipe of draft.scheduledRecipes) {
              if (calRecipe.id === vars.scheduledRecipeId) {
                calRecipe.on = context.previousOn
                break
              }
            }
          })
        },
      })
    },
  })
}

export function cacheUpsertScheduledRecipes(
  client: QueryClient,
  {
    updater,
    teamId,
  }: {
    teamId: number
    updater: (
      prev: CalendarResponse | undefined,
    ) => CalendarResponse | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueriesData<CalendarResponse>(
    { queryKey: [teamId, "calendar"] },
    updater,
  )
}
