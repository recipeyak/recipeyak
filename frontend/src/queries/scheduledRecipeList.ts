import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useChannel } from "ably/react"
import { addWeeks, endOfWeek, startOfWeek, subWeeks } from "date-fns"
import parseISO from "date-fns/parseISO"

import { calendarList } from "@/api/calendarList"
import { toISODateString } from "@/date"
import { cacheUpsertScheduledRecipesWeek } from "@/queries/scheduledRecipeCreate"
import { onRecipeDeletion } from "@/queries/scheduledRecipeDelete"
import { onScheduledRecipeUpdateSuccess } from "@/queries/scheduledRecipeUpdate"
import { useTeamId } from "@/useTeamId"

type ScheduledRecipeUpdated = {
  created: string
  createdBy: null
  id: number
  on: string
  recipe: {
    id: number
    name: string
    author: string | null
    archivedAt: string | null
    primaryImage: { id: string; url: string; backgroundUrl: string } | null
  }
  team: null
  user: null
}

// NOTE: At a high level we want the UI to be able to subscribe to a range of
// data, like, all the calendar items with date > X && date < Y. We also want to
// prefetch a bit in the past and future. But react-query doesn't really support
// this sort of range of selection, it likes specific items with it's keys so we
// do some hacky cache munging down below.

export function useScheduledRecipeList({
  startOfWeekMs,
}: {
  startOfWeekMs: number
}) {
  const teamId = useTeamId()
  const queryClient = useQueryClient()
  useChannel(`team:${teamId}:scheduled_recipe`, (message) => {
    switch (message.name) {
      case "scheduled_recipe_updated": {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const apiRes: ScheduledRecipeUpdated = JSON.parse(message.data)
        onScheduledRecipeUpdateSuccess({
          queryClient,
          scheduledRecipeId: apiRes.id,
          teamId,
          updatedCalRecipe: apiRes,
        })
        break
      }
      case "scheduled_recipe_delete": {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const apiRes: { recipeId: number } = JSON.parse(message.data)
        onRecipeDeletion(queryClient, {
          teamId,
          scheduledRecipeId: apiRes.recipeId,
        })
        break
      }
    }
  })
  return useQuery({
    queryKey: [teamId, "calendar", startOfWeekMs],
    queryFn: async () => {
      // Fetch for a given week w/ 2 weeks after & 2 weeks before
      // We paginate by week, so we overlap our fetched range
      // We want a fetch to overwrite the cache for the range
      // We want to avoid dupes with our fetches
      const start = toISODateString(startOfWeek(subWeeks(startOfWeekMs, 3)))
      const end = toISODateString(endOfWeek(addWeeks(startOfWeekMs, 3)))
      const response = await calendarList({
        start,
        end,
      })

      // Iterate through and populate each based on week
      const weekIds = new Set<Date>()
      response.scheduledRecipes.forEach((r) => {
        const weekId = startOfWeek(parseISO(r.on))
        weekIds.add(weekId)
      })
      weekIds.forEach((weekId) => {
        cacheUpsertScheduledRecipesWeek(queryClient, {
          teamId,
          weekId,
          updater: () => {
            return response
          },
        })
      })
      return response
    },
    // Schedule recipes plop in due the way we overlap/prefetch without this
    placeholderData: keepPreviousData,
  })
}
