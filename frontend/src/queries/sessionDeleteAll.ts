import { useMutation, useQueryClient } from "@tanstack/react-query"

import { sessionDeleteAll } from "@/api/sessionDeleteAll"
import { ISession } from "@/queries/sessionList"

export function useSessionDeleteAll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => sessionDeleteAll(),
    onSuccess: () => {
      // eslint-disable-next-line no-restricted-syntax
      queryClient.setQueryData<readonly ISession[]>(["sessions"], (prev) => {
        return prev?.filter((x) => x.current)
      })
    },
  })
}
