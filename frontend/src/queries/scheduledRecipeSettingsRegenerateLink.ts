import { useMutation, useQueryClient } from "@tanstack/react-query"

import { calendarGenerateLink } from "@/api/calendarGenerateLink"
import { cacheUpsertCalendarSettings } from "@/queries/scheduledRecipeSettingsFetch"
import { useTeamId } from "@/useTeamId"

export function useScheduledRecipeSettingsRegenerateLink() {
  const teamId = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => calendarGenerateLink(),
    onSuccess: (response) => {
      cacheUpsertCalendarSettings(queryClient, {
        teamId,
        updater: () => {
          return response
        },
      })
    },
  })
}
