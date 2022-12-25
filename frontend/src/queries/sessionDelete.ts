import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteSessionById } from "@/api"
import { unwrapResult } from "@/query"
import { ISession } from "@/store/reducers/user"

function deleteByIdV2({ sessionId }: { sessionId: string }): Promise<void> {
  return deleteSessionById(sessionId).then(unwrapResult)
}

export function useSessionDelete() {
  // TODO: if we delete the current session that should use the logout mutation
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteByIdV2,
    onSuccess: (_response, vars) => {
      queryClient.setQueryData(
        ["sessions"],
        (prev: readonly ISession[] | undefined) => {
          return prev?.filter((x) => x.id !== vars.sessionId)
        },
      )
    },
  })
}
