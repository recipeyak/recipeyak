import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, startOfWeek, subWeeks } from "date-fns"

import { toISODateString } from "@/date"
import { useTeamId, useUser } from "@/hooks"
import { http } from "@/http"
import { IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"
import { random32Id } from "@/uuid"

export type CalendarResponse = {
  scheduledRecipes: ICalRecipe[]
  settings: {
    syncEnabled: boolean
    calendarLink: string
  }
}

export interface ICalRecipe {
  readonly id: number
  readonly on: string
  readonly created: string
  readonly createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
  readonly recipe: {
    readonly id: number
    readonly name: string
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

const scheduleRecipe = (
  recipeID: IRecipe["id"],
  teamID: number | "personal",
  on: Date | string,
) => {
  return http.post<ICalRecipe>(`/api/v1/t/${teamID}/calendar/`, {
    recipe: recipeID,
    on: toISODateString(on),
  })
}

function scheduleRecipeV2({
  recipeID,
  teamID,
  on,
}: {
  recipeID: number
  recipeName: string
  teamID: number
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
        queryClient.setQueryData<CalendarResponse>(
          [teamID, "calendar", weekId.getTime()],
          (data) => {
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
        queryClient.setQueryData<CalendarResponse>(
          [teamID, "calendar", weekId.getTime()],
          (data) => {
            if (data == null) {
              return data
            }
            const updatedScheduledRecipes: ICalRecipe[] = [
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
