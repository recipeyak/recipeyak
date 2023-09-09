import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"

import { CalendarResponse, ICalRecipe, updateScheduleRecipe } from "@/api"
import { unwrapResult } from "@/query"

function scheduledRecipeUpdate({
  scheduledRecipeId,
  teamID,
  update,
}: {
  scheduledRecipeId: number
  teamID: number
  update: {
    // ISO date string
    on: string
  }
}): Promise<ICalRecipe> {
  return updateScheduleRecipe(scheduledRecipeId, teamID, update).then(
    unwrapResult,
  )
}

export function onSuccess(params: {
  queryClient: QueryClient
  teamID: number
  scheduledRecipeId: number
  updatedCalRecipe: ICalRecipe
}) {
  params.queryClient.setQueriesData(
    [params.teamID, "calendar"],
    (data: unknown) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const oldData = data as CalendarResponse | undefined
      // TODO: we also need to be careful about shape of the data changing due to persistance
      if (oldData == null) {
        return oldData
      }
      const updatedScheduledRecipes = oldData.scheduledRecipes.map(
        (calRecipe) => {
          if (calRecipe.id === params.scheduledRecipeId) {
            return params.updatedCalRecipe
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
}

export function useScheduledRecipeUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: scheduledRecipeUpdate,
    onMutate: (vars) => {
      let previousOn: string | undefined
      queryClient.setQueriesData([vars.teamID, "calendar"], (data: unknown) => {
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
      })

      return {
        optimisticScheduledRecipeId: vars.scheduledRecipeId,
        previousOn,
      }
    },
    onSuccess: (response, vars) => {
      onSuccess({
        queryClient,
        teamID: vars.teamID,
        scheduledRecipeId: vars.scheduledRecipeId,
        updatedCalRecipe: response,
      })
    },
    onError: (__err, vars, context) => {
      if (context == null) {
        return
      }
      queryClient.setQueriesData([vars.teamID, "calendar"], (data: unknown) => {
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
      })
    },
  })
}
