import { useMutation, useQueryClient } from "@tanstack/react-query"

import { calendarPinCreate } from "@/api/calendarPinCreate"
import { cacheUpsertCalendars } from "@/queries/useCalendarsFetch"
import { useTeamId } from "@/useTeamId"

export function useCalendarMutation() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: calendarPinCreate,
    onSuccess: (_response, vars) => {
      cacheUpsertCalendars(queryClient, {
        updater: (prev) => {
          return {
            calendars:
              prev?.calendars.map((calendar) => {
                if (calendar.id === vars.calendar_id) {
                  return { ...calendar, pinned: true }
                }
                return { ...calendar, pinned: false }
              }) ?? [],
          }
        },
      })
      void queryClient.invalidateQueries({ queryKey: [teamId, "calendar"] })
    },
  })
}
