import { useQuery } from "@tanstack/react-query"

import { getCalendarRecipeListRequestBuilder } from "@/api"
import { unwrapEither } from "@/query"

export function useSchedulePreviewList({
  teamID,
  start,
  end,
}: {
  teamID: number | "personal"
  start: Date
  end: Date
}) {
  return useQuery(["schedule"], () =>
    getCalendarRecipeListRequestBuilder({
      teamID,
      start,
      end,
    })
      .send()
      .then(unwrapEither),
  )
}
