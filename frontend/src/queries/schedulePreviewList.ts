import { useQuery } from "@tanstack/react-query"

import { getCalendarRecipeList } from "@/queries/scheduledRecipeList"
import { unwrapEither } from "@/query"
import { useTeamId } from "@/useTeamId"

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
    queryFn: () => getCalendarRecipeList({ start, end }).then(unwrapEither),
  })
}
