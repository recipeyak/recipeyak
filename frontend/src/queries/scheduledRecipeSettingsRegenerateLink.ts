import { useMutation, useQueryClient } from "@tanstack/react-query"

import { calendarGenerateLink } from "@/api/calendarGenerateLink"
import { CalendarResponse } from "@/queries/scheduledRecipeCreate"
import { useTeamId } from "@/useTeamId"

export function useScheduledRecipeSettingsRegenerateLink() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => calendarGenerateLink(),
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
  })
}
