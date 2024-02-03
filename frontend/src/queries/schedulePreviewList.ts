import { useQuery } from "@tanstack/react-query"

import { calendarList } from "@/api/calendarList"
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
    queryFn: () => calendarList({ start, end }),
  })
}
