import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { calendarList } from "@/api/calendarList"
import { useTeamId } from "@/useTeamId"

export function useScheduledRecipeSettingsFetch() {
  const teamID = useTeamId()
  return useQuery({
    queryKey: [teamID, "calendar-settings"],
    queryFn: () => {
      // TODO: we could move this to a different endpoint or maybe stuff it in
      // the preload when we get there
      const start = new Date()
      return calendarList({ start, end: start })
    },
    select: (data) => data.settings,
    // Schedule recipes plop in due the way we overlap/prefetch without this
    placeholderData: keepPreviousData,
  })
}
