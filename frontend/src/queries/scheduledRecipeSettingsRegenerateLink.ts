import { useMutation, useQueryClient } from "@tanstack/react-query"

import { generateCalendarLink } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

type CalendarResponse = {
  settings: {
    syncEnabled: boolean
    calendarLink: string
  }
}

export function useScheduledRecipeSettingsRegenerateLink() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      return generateCalendarLink({ teamID }).then(unwrapEither)
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
  })
}
