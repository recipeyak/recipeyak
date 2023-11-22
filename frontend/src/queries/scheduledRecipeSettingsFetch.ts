import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useTeamId } from "@/hooks"
import { getCalendarRecipeList } from "@/queries/scheduledRecipeList"
import { unwrapEither } from "@/query"

export function useScheduledRecipeSettingsFetch() {
  const teamID = useTeamId()
  return useQuery({
    queryKey: [teamID, "calendar-settings"],
    queryFn: () => {
      // TODO: we could move this to a different endpoint or maybe stuff it in
      // the preload when we get there
      const start = new Date()
      return getCalendarRecipeList({ teamID, start, end: start }).then(
        unwrapEither,
      )
    },
    select: (data) => data.settings,
    // Schedule recipes plop in due the way we overlap/prefetch without this
    placeholderData: keepPreviousData,
  })
}
