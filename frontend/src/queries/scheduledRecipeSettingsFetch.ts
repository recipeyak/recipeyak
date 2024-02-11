import { keepPreviousData, QueryClient, useQuery } from "@tanstack/react-query"

import { calendarSettingsRetrieve } from "@/api/calendarSettingsRetrieve"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useTeamId } from "@/useTeamId"

export function useScheduledRecipeSettingsFetch() {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "calendar-settings"],
    queryFn: calendarSettingsRetrieve,
    // Schedule recipes pop in due the way we overlap/prefetch without this
    placeholderData: keepPreviousData,
  })
}

type CalendarResponse = ResponseFromUse<typeof useScheduledRecipeSettingsFetch>

function getQueryKey(teamId: number) {
  return [teamId, "calendar-settings"]
}

export function cacheUpsertCalendarSettings(
  client: QueryClient,
  {
    updater,
    teamId,
  }: {
    teamId: number
    updater: (
      prev: CalendarResponse | undefined,
    ) => CalendarResponse | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<CalendarResponse>(getQueryKey(teamId), updater)
}
