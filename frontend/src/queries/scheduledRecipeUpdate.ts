import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CalendarResponse, updateScheduleRecipe } from "@/api"
import { unwrapResult } from "@/query"
import { ICalRecipe } from "@/store/reducers/calendar"

function scheduledRecipeUpdate({
  scheduledRecipeId,
  teamID,
  update,
}: {
  scheduledRecipeId: number
  teamID: number | "personal"
  update: {
    // ISO date string
    on: string
  }
}): Promise<ICalRecipe> {
  return updateScheduleRecipe(scheduledRecipeId, teamID, update).then(
    unwrapResult,
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
    onSuccess: (response, vars, context) => {
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
              return response
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
