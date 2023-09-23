import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { ISession } from "@/queries/sessionList"
import { unwrapResult } from "@/query"

const deleteAllSessions = () => http.delete("/api/v1/sessions/")

export function useSessionDeleteAll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteAllSessions().then(unwrapResult),
    onSuccess: () => {
      queryClient.setQueryData<readonly ISession[]>(["sessions"], (prev) => {
        return prev?.filter((x) => x.current)
      })
    },
  })
}
