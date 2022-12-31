import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteAllSessions, ISession } from "@/api"
import { unwrapResult } from "@/query"

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
