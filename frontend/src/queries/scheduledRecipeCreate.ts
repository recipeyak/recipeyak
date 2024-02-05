import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, parseISO, startOfWeek, subWeeks } from "date-fns"

import { scheduledRecipeCreate } from "@/api/scheduledRecipeCreate"
import { toISODateString } from "@/date"
import { toast } from "@/toast"
import { useTeamId } from "@/useTeamId"
import { useUser } from "@/useUser"
import { random32Id } from "@/uuid"

export type CalendarResponse = {
  scheduledRecipes: ScheduledRecipe[]
  settings: {
    syncEnabled: boolean
    calendarLink: string
  }
}

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
): ScheduledRecipe {
  return {
    id: tempId,
    created: String(new Date()),
    recipe: {
      id: recipe.id,
      name: recipe.name,
      author: null,
      archivedAt: null,
      primaryImage: null,
    },
    team: null,
    user: null,
    on: toISODateString(on),
    createdBy: {
      // TODO: we should preload user so it isn't possible for it to be null
      id: user.id ?? -1,
      name: user.name,
      avatar_url: user.avatarURL,
    },
  }
}

export type ScheduledRecipe = Awaited<ReturnType<typeof scheduledRecipeCreate>>

export function useScheduleRecipeCreate() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  const user = useUser()
  return useMutation({
    mutationFn: ({
      recipeID,
      on,
    }: {
      recipeID: number
      recipeName: string
      on: string
    }) => scheduledRecipeCreate({ recipe: recipeID, on }),
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
      const weekId = startOfWeek(parseISO(vars.on))

      const weekIds = [
        subWeeks(weekId, 2),
        subWeeks(weekId, 1),
        weekId,
        addWeeks(weekId, 1),
        addWeeks(weekId, 2),
      ]

      weekIds.forEach((weekId) => {
        // eslint-disable-next-line no-restricted-syntax
        queryClient.setQueryData<CalendarResponse>(
          [teamID, "calendar", weekId.getTime()],
          (data) => {
            if (data == null) {
              return data
            }
            const updatedScheduledRecipes: ScheduledRecipe[] = [
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
        // TODO: replace with type safe wrapper function

        // eslint-disable-next-line no-restricted-syntax
        queryClient.setQueryData<CalendarResponse>(
          [teamID, "calendar", weekId.getTime()],
          (data) => {
            if (data == null) {
              return data
            }
            const updatedScheduledRecipes: ScheduledRecipe[] = [
              ...data.scheduledRecipes.filter(
                (x) =>
                  x.id !== context?.optimisticScheduledRecipeId &&
                  x.id !== response.id,
              ),
              response,
            ]
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
        // TODO: replace with type safe wrapper function

        // eslint-disable-next-line no-restricted-syntax
        queryClient.setQueryData<CalendarResponse>(
          [teamID, "calendar", weekId.getTime()],
          (data) => {
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
