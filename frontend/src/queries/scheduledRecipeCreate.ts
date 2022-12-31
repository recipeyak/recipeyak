import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, startOfWeek, subWeeks } from "date-fns"

import { CalendarResponse, ICalRecipe, scheduleRecipe } from "@/api"
import { toISODateString } from "@/date"
import { useTeamId, useUser } from "@/hooks"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"
import { random32Id } from "@/uuid"

function toCalRecipe(
  recipe: {
    id: number
    name: string
  },
  tempId: number,
  on: string | Date,
  user: {
    id: number | null
    name: string
    avatarURL: string
  },
): ICalRecipe {
  return {
    id: tempId,
    created: String(new Date()),
    recipe: {
      id: recipe.id,
      name: recipe.name,
    },
    on: toISODateString(on),
    createdBy: {
      // TODO: we should preload user so it isn't possible for it to be null
      id: user.id ?? -1,
      name: user.name,
      avatar_url: user.avatarURL,
    },
  }
}

function scheduleRecipeV2({
  recipeID,
  teamID,
  on,
}: {
  recipeID: number
  recipeName: string
  teamID: number | "personal"
  on: Date
}): Promise<ICalRecipe> {
  return scheduleRecipe(recipeID, teamID, on).then(unwrapResult)
}

export function useScheduleRecipeCreate() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: scheduleRecipeV2,
    onMutate: (vars) => {
      const tempId = random32Id()
      const tempScheduledRecipe = toCalRecipe(
        {
          id: vars.recipeID,
          name: vars.recipeName,
        },
        tempId,
        vars.on,
        user,
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
      toast.error("error scheduling recipe")
    },
  })
}
