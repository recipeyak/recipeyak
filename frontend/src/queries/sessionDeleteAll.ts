import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteAllSessions } from "@/api"
import { unwrapResult } from "@/query"
import { ISession } from "@/store/reducers/user"

export function useSessionDeleteAll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteAllSessions().then(unwrapResult),
    onSuccess: () => {
      queryClient.setQueryData(
        ["sessions"],
        (prev: readonly ISession[] | undefined) => {
          return prev?.filter((x) => x.current)
        },
      )
    },
  })
}
