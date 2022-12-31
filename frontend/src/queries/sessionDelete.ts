import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteSessionById, ISession } from "@/api"
import { unwrapResult } from "@/query"

function deleteByIdV2({ sessionId }: { sessionId: string }): Promise<void> {
  return deleteSessionById(sessionId).then(unwrapResult)
}

export function useSessionDelete() {
  // TODO: if we delete the current session that should use the logout mutation
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteByIdV2,
    onSuccess: (_response, vars) => {
      queryClient.setQueryData<readonly ISession[]>(["sessions"], (prev) => {
        return prev?.filter((x) => x.id !== vars.sessionId)
      })
    },
  })
}
