import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as t from "io-ts"

import { http } from "@/http"
import { CalendarResponse } from "@/queries/scheduledRecipeCreate"
import { unwrapEither } from "@/query"
import { useTeamId } from "@/useTeamId"

function generateCalendarLink() {
  return http.request({
    method: "POST",
    url: `/api/v1/calendar/generate_link/`,
    shape: t.type({
      calendarLink: t.string,
    }),
  })
}

export function useScheduledRecipeSettingsRegenerateLink() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => generateCalendarLink().then(unwrapEither),
    onSuccess: (response) => {
      queryClient.setQueryData<CalendarResponse>(
        [teamID, "calendar-settings"],
        (prev) => {
          if (prev == null) {
            return
          }
          return { ...prev, settings: { ...prev.settings, ...response } }
        },
      )
    },
  })
}
