import { useMutation, useQueryClient } from "@tanstack/react-query"

import { acceptInvite, IInvite } from "@/api"
import { unwrapResult } from "@/query"

export function useInviteAccept() {
  // TODO: if we delete the current session that should use the logout mutation
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) =>
      acceptInvite(inviteId).then(unwrapResult),
    onSuccess: (_response, vars) => {
      queryClient.setQueryData<readonly IInvite[]>(["invites"], (prev) => {
        return prev?.map((x) => {
          if (x.id === vars.inviteId) {
            return { ...x, status: "accepted" as const }
          }
          return x
        })
      })
    },
  })
}
