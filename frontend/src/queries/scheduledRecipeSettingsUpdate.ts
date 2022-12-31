import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CalendarResponse, updateCalendarSettings } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

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
