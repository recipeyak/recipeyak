import { QueryClient, useQuery } from "@tanstack/react-query"

import { calendarsList } from "@/api/calendarsList"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"

export function useCalendars() {
  return useQuery({
    queryKey: getQueryKey(),
    queryFn: calendarsList,
  })
}

function getQueryKey() {
  return ["calendars-list"]
}

type Response = ResponseFromUse<typeof useCalendars>

export function cacheUpsertCalendars(
  client: QueryClient,
  {
    updater,
  }: {
    updater: (prev: Response | undefined) => Response | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<Response>(getQueryKey(), updater)
}
