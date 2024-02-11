import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"

import { sessionDeleteAll } from "@/api/sessionDeleteAll"
import { ISession } from "@/queries/sessionList"

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

export function cacheUpsertSession(
  client: QueryClient,
  {
    updater,
  }: {
    updater: (
      prev: readonly ISession[] | undefined,
    ) => readonly ISession[] | undefined
  },
) {
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<readonly ISession[]>(["session"], updater)
}
