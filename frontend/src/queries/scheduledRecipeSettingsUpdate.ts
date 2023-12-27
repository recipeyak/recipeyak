import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as t from "io-ts"

import { http } from "@/http"
import { CalendarResponse } from "@/queries/scheduledRecipeCreate"
import { unwrapEither } from "@/query"
import { useTeamId } from "@/useTeamId"

function updateCalendarSettings({
  data,
}: {
  readonly data: {
    readonly syncEnabled: boolean
  }
}) {
  return http.request({
    method: "PATCH",
    url: `/api/v1/calendar/settings/`,
    data,
    shape: t.type({
      syncEnabled: t.boolean,
      calendarLink: t.string,
    }),
  })
}

export function useScheduledRecipeSettingsUpdate() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ update }: { update: { syncEnabled: boolean } }) => {
      return updateCalendarSettings({ data: update }).then(unwrapEither)
    },
    onMutate: (variables) => {
      let prevSettings: CalendarResponse["settings"] | undefined
      queryClient.setQueryData<CalendarResponse>(
        [teamID, "calendar-settings"],
        (prev) => {
          if (prev == null) {
            return
          }
          prevSettings = prev.settings
          return {
            ...prev,
            settings: {
              ...prev.settings,
              ...variables.update,
            },
          }
        },
      )
      return { prevSettings }
    },
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
    onError: (_error, _variables, context) => {
      queryClient.setQueryData<CalendarResponse>(
        [teamID, "calendar-settings"],
        (prev) => {
          if (prev == null || context?.prevSettings == null) {
            return
          }
          return { ...prev, settings: context.prevSettings }
        },
      )
    },
  })
}
