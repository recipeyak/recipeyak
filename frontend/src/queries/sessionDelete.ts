import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { sessionDelete } from "@/api/sessionDelete"
import { cacheUpsertSession } from "@/queries/sessionList"

export function useSessionDelete() {
  // TODO: if we delete the current session that should use the logout mutation
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId }: { sessionId: string }) =>
      sessionDelete({ session_id: sessionId }),
    onSuccess: (_response, vars) => {
      cacheUpsertSession(queryClient, {
        updater: (prev) => {
          return produce(prev, (draft) => {
            if (draft == null) {
              return
            }
            const sessionIndex = draft.findIndex((x) => x.id === vars.sessionId)
            draft.splice(sessionIndex, 1)
          })
        },
      })
    },
  })
}
