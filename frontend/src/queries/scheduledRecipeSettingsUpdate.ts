import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateCalendarSettings } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

type CalendarResponse = {
  settings: {
    syncEnabled: boolean
    calendarLink: string
  }
}

export function useScheduledRecipeSettingsUpdate() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamID,
      update,
    }: {
      teamID: number | "personal"
      update: { syncEnabled: boolean }
    }) => {
      return updateCalendarSettings({ teamID, data: update }).then(unwrapEither)
    },
    onMutate: (variables) => {
      let prevSettings: CalendarResponse["settings"] | undefined
      queryClient.setQueryData(
        [teamID, "calendar-settings"],
        (prev: CalendarResponse | undefined): CalendarResponse | undefined => {
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
      queryClient.setQueryData(
        [teamID, "calendar-settings"],
        (prev: CalendarResponse | undefined): CalendarResponse | undefined => {
          if (prev == null) {
            return
          }
          return { ...prev, settings: { ...prev.settings, ...response } }
        },
      )
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(
        [teamID, "calendar-settings"],
        (prev: CalendarResponse | undefined): CalendarResponse | undefined => {
          if (prev == null || context?.prevSettings == null) {
            return
          }
          return { ...prev, settings: context.prevSettings }
        },
      )
    },
  })
}
