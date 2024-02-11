import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { calendarUpdateSettings } from "@/api/calendarUpdateSettings"
import { cacheUpsertCalendarSettings } from "@/queries/scheduledRecipeSettingsFetch"
import { useTeamId } from "@/useTeamId"

export function useScheduledRecipeSettingsUpdate() {
  const teamId = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ update }: { update: { syncEnabled: boolean } }) => {
      return calendarUpdateSettings({ syncEnabled: update.syncEnabled })
    },
    onMutate: (variables) => {
      let prevSyncEnabled: boolean | undefined
      cacheUpsertCalendarSettings(queryClient, {
        teamId,
        updater: (prev) => {
          return produce(prev, (draft) => {
            if (draft == null) {
              return
            }
            draft.syncEnabled = variables.update.syncEnabled
            prevSyncEnabled = draft.syncEnabled
          })
        },
      })
      return { prevSyncEnabled }
    },
    onSuccess: (response) => {
      cacheUpsertCalendarSettings(queryClient, {
        teamId,
        updater: (prev) => {
          return produce(prev, (draft) => {
            if (draft == null) {
              return
            }
            return response
          })
        },
      })
    },
    onError: (_error, _variables, context) => {
      cacheUpsertCalendarSettings(queryClient, {
        teamId,
        updater: (prev) => {
          return produce(prev, (draft) => {
            if (draft == null || context?.prevSyncEnabled == null) {
              return
            }
            draft.syncEnabled = context.prevSyncEnabled
          })
        },
      })
    },
  })
}
