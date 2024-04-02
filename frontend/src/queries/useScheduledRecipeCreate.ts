import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { addWeeks, parseISO, startOfWeek, subWeeks } from "date-fns"
import produce from "immer"

import { scheduledRecipeCreate } from "@/api/scheduledRecipeCreate"
import { toISODateString } from "@/date"
import { toast } from "@/toast"
import { useTeamId } from "@/useTeamId"
import { useUser } from "@/useUser"
import { random32Id } from "@/uuid"

export type CalendarResponse = {
  scheduledRecipes: ScheduledRecipe[]
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
  const teamId = useTeamId()
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
        cacheUpsertScheduledRecipesWeek(queryClient, {
          teamId,
          weekId,
          updater: (prev) => {
            return produce(prev, (draft) => {
              if (draft == null) {
                return
              }
              draft.scheduledRecipes.push(tempScheduledRecipe)
            })
          },
        })
      })

      return { optimisticScheduledRecipeId: tempScheduledRecipe.id, weekIds }
    },
    onSuccess: (response, __vars, context) => {
      if (context == null) {
        return
      }
      context.weekIds.forEach((weekId) => {
        cacheUpsertScheduledRecipesWeek(queryClient, {
          teamId,
          weekId,
          updater: (prev) => {
            return produce(prev, (draft) => {
              if (draft == null) {
                return
              }
              draft.scheduledRecipes = draft.scheduledRecipes.filter(
                (x) =>
                  !(
                    x.id === context.optimisticScheduledRecipeId ||
                    x.id === response.id
                  ),
              )

              // 3. add the server value
              draft.scheduledRecipes.push(response)
            })
          },
        })
      })
    },
    onError: (__err, __vars, context) => {
      if (context == null) {
        return
      }
      context.weekIds.forEach((weekId) => {
        cacheUpsertScheduledRecipesWeek(queryClient, {
          teamId,
          weekId,
          updater: (prev) => {
            return produce(prev, (draft) => {
              if (draft == null) {
                return
              }
              const recipeIndex = draft.scheduledRecipes.findIndex(
                (x) => x.id === context.optimisticScheduledRecipeId,
              )
              draft.scheduledRecipes.splice(recipeIndex, 1)
            })
          },
        })
      })
      toast.error("error scheduling recipe")
    },
  })
}

export function cacheUpsertScheduledRecipesWeek(
  client: QueryClient,
  {
    updater,
    teamId,
    weekId,
  }: {
    teamId: number
    weekId: Date
    updater: (
      prev: CalendarResponse | undefined,
    ) => CalendarResponse | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<CalendarResponse>(
    [teamId, "calendar", weekId.getTime()],
    updater,
  )
}
