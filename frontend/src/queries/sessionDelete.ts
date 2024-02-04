import { useMutation, useQueryClient } from "@tanstack/react-query"

import { sessionDelete } from "@/api/sessionDelete"
import { ISession } from "@/queries/sessionList"

export function useSessionDelete() {
  // TODO: if we delete the current session that should use the logout mutation
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId }: { sessionId: string }) =>
      sessionDelete({ session_id: sessionId }),
    onSuccess: (_response, vars) => {
      // eslint-disable-next-line no-restricted-syntax
      queryClient.setQueryData<readonly ISession[]>(["sessions"], (prev) => {
        return prev?.filter((x) => x.id !== vars.sessionId)
      })
    },
  })
}
