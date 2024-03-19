import { useMutation, useQueryClient } from "@tanstack/react-query"

import { sessionDeleteAll } from "@/api/sessionDeleteAll"
import { cacheUpsertSession } from "@/queries/useSessionList"

export function useSessionDeleteAll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => sessionDeleteAll(),
    onSuccess: () => {
      cacheUpsertSession(queryClient, {
        updater: (prev) => {
          // Ignore our current session
          return prev?.filter((x) => x.current)
        },
      })
    },
  })
}
