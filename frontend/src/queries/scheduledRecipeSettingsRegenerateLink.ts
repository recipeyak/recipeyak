import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CalendarResponse, generateCalendarLink } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

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
