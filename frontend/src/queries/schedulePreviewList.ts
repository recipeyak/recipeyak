import { useQuery } from "@tanstack/react-query"

import { getCalendarRecipeListRequestBuilder } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

export function useSchedulePreviewList({
  start,
  end,
}: {
  start: Date
  end: Date
}) {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "schedule", start, end],
    queryFn: () =>
      getCalendarRecipeListRequestBuilder({
        teamID: teamId,
        start,
        end,
      })
        .send()
        .then(unwrapEither),
  })
}
