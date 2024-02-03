import { useMutation, useQueryClient } from "@tanstack/react-query"

import { calendarUpdateSettings } from "@/api/calendarUpdateSettings"
import { CalendarResponse } from "@/queries/scheduledRecipeCreate"
import { useTeamId } from "@/useTeamId"

export function useScheduledRecipeSettingsUpdate() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ update }: { update: { syncEnabled: boolean } }) => {
      return calendarUpdateSettings({ syncEnabled: update.syncEnabled })
    },
    onMutate: (variables) => {
      let prevSettings: CalendarResponse["settings"] | undefined

      // eslint-disable-next-line no-restricted-syntax
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
      // eslint-disable-next-line no-restricted-syntax
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
      // eslint-disable-next-line no-restricted-syntax
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
