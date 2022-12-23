import { useQuery, useQueryClient } from "@tanstack/react-query"
import { addWeeks, endOfWeek, startOfWeek, subWeeks } from "date-fns"
import parseISO from "date-fns/parseISO"

import { getCalendarRecipeList } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

// TODO: describe higher level
//   [1, "calendar", 1671339600000]

// [teamId, "calendar"]

// teamId, calendar, dates

// scan([teamId, calendar, dates > 12323 < fsldjfsldf])
// scan([teamId, calendar, 12323])

export function useScheduledRecipeList({
  startOfWeekMs,
}: {
  startOfWeekMs: number
}) {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
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
        queryClient.setQueryData([teamID, "calendar", weekId], response)
      })
    },
    // Schedule recipes plop in due the way we overlap/prefetch without this
    keepPreviousData: true,
  })
}
