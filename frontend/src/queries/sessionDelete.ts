import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { ISession } from "@/queries/sessionList"
import { unwrapResult } from "@/query"

const deleteSessionById = (id: ISession["id"]) =>
  http.delete(`/api/v1/sessions/${id}/`)

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
