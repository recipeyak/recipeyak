import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"

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
  params.queryClient.setQueriesData(
    { queryKey: [params.teamID, "calendar"] },
    (data: unknown) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const oldData = data as CalendarResponse | undefined
      // TODO: we also need to be careful about shape of the data changing due to persistance
      if (oldData == null) {
        return oldData
      }
      const updatedScheduledRecipes = oldData.scheduledRecipes.filter(
        (calRecipe) => calRecipe.id !== params.scheduledRecipeId,
      )

      return {
        ...oldData,
        scheduledRecipes: [...updatedScheduledRecipes, params.updatedCalRecipe],
      }
    },
  )
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
      queryClient.setQueriesData(
        { queryKey: [teamId, "calendar"] },
        (data: unknown) => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const oldData = data as CalendarResponse | undefined
          // TODO: we also need to be careful about shape of the data changing due to persistance
          if (oldData == null) {
            return oldData
          }
          const updatedScheduledRecipes = oldData.scheduledRecipes.map(
            (calRecipe) => {
              if (calRecipe.id === vars.scheduledRecipeId) {
                previousOn = calRecipe.on
                return { ...calRecipe, on: vars.update.on }
              } else {
                return calRecipe
              }
            },
          )
          return {
            ...oldData,
            scheduledRecipes: updatedScheduledRecipes,
          }
        },
      )

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
      queryClient.setQueriesData(
        { queryKey: [teamId, "calendar"] },
        (data: unknown) => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const oldData = data as CalendarResponse | undefined
          // TODO: we also need to be careful about shape of the data changing due to persistance
          if (oldData == null) {
            return oldData
          }
          const updatedScheduledRecipes = oldData.scheduledRecipes.map(
            (calRecipe) => {
              if (calRecipe.id === vars.scheduledRecipeId) {
                return { ...calRecipe, on: context.previousOn }
              } else {
                return calRecipe
              }
            },
          )
          return {
            ...oldData,
            scheduledRecipes: updatedScheduledRecipes,
          }
        },
      )
    },
  })
}
