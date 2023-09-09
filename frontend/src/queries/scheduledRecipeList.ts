import { configureAbly, useChannel } from "@ably-labs/react-hooks"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { addWeeks, endOfWeek, startOfWeek, subWeeks } from "date-fns"
import parseISO from "date-fns/parseISO"

import { CalendarResponse, getCalendarRecipeList } from "@/api"
import { useTeamId } from "@/hooks"
import { onSuccess } from "@/queries/scheduledRecipeUpdate"
import { unwrapEither } from "@/query"

configureAbly({
  authUrl: "/api/v1/auth/ably",
})

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
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  useChannel("scheduled_recipe:2", (message) => {
    switch (message.name) {
      case "scheduled_recipe_updated": {
        const apiRes = JSON.parse(message.data)
        onSuccess({
          queryClient,
          scheduledRecipeId: apiRes.id,
          teamID,
          updatedCalRecipe: apiRes,
        })
        break
      }
    }
  })
  return useQuery({
    queryKey: [teamID, "calendar", startOfWeekMs],
    queryFn: () => {
      // Fetch for a given week w/ 2 weeks after & 2 weeks before
      // We paginate by week, so we overlap our fetched range
      // We want a fetch to overwrite the cache for the range
      // We want to avoid dupes with our fetches
      const start = startOfWeek(subWeeks(startOfWeekMs, 3))
      const end = endOfWeek(addWeeks(startOfWeekMs, 3))
      return getCalendarRecipeList({ teamID, start, end }).then(unwrapEither)
    },
    onSuccess: (response) => {
      // Iterate through and populate each based on week
      const weekIds = new Set<number>()
      response.scheduledRecipes.forEach((r) => {
        const weekId = startOfWeek(parseISO(r.on)).getTime()
        weekIds.add(weekId)
      })
      weekIds.forEach((weekId) => {
        queryClient.setQueryData<CalendarResponse>(
          [teamID, "calendar", weekId],
          response,
        )
      })
    },
    // Schedule recipes plop in due the way we overlap/prefetch without this
    keepPreviousData: true,
  })
}
