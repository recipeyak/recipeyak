import { useQuery } from "@tanstack/react-query"

import { useTeamId } from "@/hooks"
import { getCalendarRecipeList } from "@/queries/scheduledRecipeList"
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
      getCalendarRecipeList({ teamID: teamId, start, end }).then(unwrapEither),
  })
}
