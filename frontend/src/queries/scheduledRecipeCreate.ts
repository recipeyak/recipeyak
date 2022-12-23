import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, startOfWeek, subWeeks } from "date-fns"

import { CalendarResponse, scheduleRecipe } from "@/api"
import { useDispatch, useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"
import { ICalRecipe } from "@/store/reducers/calendar"
import store from "@/store/store"
import { showNotificationWithTimeoutAsync, toCalRecipe } from "@/store/thunks"
import { random32Id } from "@/uuid"
import { isSuccessOrRefetching } from "@/webdata"

function scheduleRecipeV2({
  recipeID,
  teamID,
  on,
  count,
}: {
  recipeID: number
  teamID: number | "personal"
  on: Date
  count?: string | number
}): Promise<ICalRecipe> {
  return scheduleRecipe(recipeID, teamID, on, count).then(unwrapResult)
}

export function useScheduleRecipeCreate() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  return useMutation({
    mutationFn: scheduleRecipeV2,
    onMutate: (vars) => {
      const tempId = random32Id()
      // TODO: move recipes data to react-query
      const recipe = store.getState().recipes.byId[vars.recipeID]
      if (!isSuccessOrRefetching(recipe)) {
        console.warn("no optimistic update")
        return
      }
      const tempScheduledRecipe = toCalRecipe(
        recipe.data,
        tempId,
        vars.on,
        1,
        /* user */ null,
      )
      console.warn("optimistic update!!!!!!!!!!!!!")
      //   queryClient.getQueryData([
      //     teamID,
      //     "calendar",
      //     startOfWeek(vars.on).getTime(),
      //   ])

      //   queryClient.
      // startOfWeek(), startOfWeek() - 1 week, startOfWeek() - 2 week, startOfWeek() + 1 week, startOfWeek() + 2 week

      const weekId = startOfWeek(vars.on)

      // const weekId

      // TODO: maybe we could fetch a given month, or 2 and only have 1 to 2 months to deal with

      // TODO: explain

      const weekIds = [
        subWeeks(weekId, 2),
        subWeeks(weekId, 1),
        weekId,
        addWeeks(weekId, 1),
        addWeeks(weekId, 2),
      ]

      weekIds.forEach((weekId) => {
        queryClient.setQueryData(
          [teamID, "calendar", weekId.getTime()],
          (
            data: CalendarResponse | undefined,
          ): CalendarResponse | undefined => {
            if (data == null) {
              return data
            }
            const updatedScheduledRecipes: ICalRecipe[] = [
              ...data.scheduledRecipes,
              tempScheduledRecipe,
            ]
            return { ...data, scheduledRecipes: updatedScheduledRecipes }
          },
        )
      })

      return { optimisticScheduledRecipeId: tempScheduledRecipe.id, weekIds }
    },
    onSuccess: (response, __vars, context) => {
      if (context == null) {
        return
      }
      context.weekIds.forEach((weekId) => {
        queryClient.setQueryData(
          [teamID, "calendar", weekId.getTime()],
          (
            data: CalendarResponse | undefined,
          ): CalendarResponse | undefined => {
            if (data == null) {
              return data
            }
            const updatedScheduledRecipes: ICalRecipe[] =
              data.scheduledRecipes.map((x) => {
                if (x.id === context?.optimisticScheduledRecipeId) {
                  return response
                }
                return x
              })
            return {
              ...data,
              scheduledRecipes: updatedScheduledRecipes,
            }
          },
        )
      })
    },
    onError: (__err, __vars, context) => {
      if (context == null) {
        return
      }
      context.weekIds.forEach((weekId) => {
        queryClient.setQueryData(
          [teamID, "calendar", weekId.getTime()],
          (
            data: CalendarResponse | undefined,
          ): CalendarResponse | undefined => {
            if (data == null) {
              return data
            }
            const updatedScheduledRecipes = data.scheduledRecipes.filter(
              (x) => x.id !== context?.optimisticScheduledRecipeId,
            )
            return {
              ...data,
              scheduledRecipes: updatedScheduledRecipes,
            }
          },
        )
      })
      showNotificationWithTimeoutAsync(dispatch)({
        message: "error scheduling recipe",
        level: "danger",
        delay: 3000,
      })
    },
  })
}
