import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, startOfWeek, subWeeks } from "date-fns"

import { CalendarResponse, scheduleRecipe } from "@/api"
import { toISODateString } from "@/date"
import { useDispatch, useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"
import { ICalRecipe } from "@/store/reducers/calendar"
import { IRecipe } from "@/store/reducers/recipes"
import store from "@/store/store"
import { showNotificationWithTimeoutAsync } from "@/store/thunks"
import { random32Id } from "@/uuid"
import { isSuccessOrRefetching } from "@/webdata"

function toCalRecipe(
  recipe: Pick<IRecipe, "id" | "name" | "owner">,
  tempId: number,
  on: string | Date,
  user: {
    id: number | null
    name: string
    avatarURL: string
  } | null,
): ICalRecipe {
  return {
    id: tempId,
    created: String(new Date()),
    recipe: {
      id: recipe.id,
      name: recipe.name,
    },
    on: toISODateString(on),
    user: recipe.owner.type === "user" ? recipe.owner.id : null,
    team: recipe.owner.type === "team" ? recipe.owner.id : null,
    createdBy:
      user != null
        ? {
            id: String(user.id),
            name: user.name,
            avatar_url: user.avatarURL,
          }
        : null,
  }
}

function scheduleRecipeV2({
  recipeID,
  teamID,
  on,
}: {
  recipeID: number
  teamID: number | "personal"
  on: Date
}): Promise<ICalRecipe> {
  return scheduleRecipe(recipeID, teamID, on).then(unwrapResult)
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
        /* user */ null,
      )
      const weekId = startOfWeek(vars.on)

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
