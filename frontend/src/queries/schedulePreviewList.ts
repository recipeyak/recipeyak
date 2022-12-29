import { useQuery } from "@tanstack/react-query"

import { getCalendarRecipeListRequestBuilder } from "@/api"
import { useTeamId } from "@/hooks"
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
  const teamId = useTeamId()
  return useQuery([teamId, "schedule"], () =>
    getCalendarRecipeListRequestBuilder({
      teamID,
      start,
      end,
    })
      .send()
      .then(unwrapEither),
  )
}
