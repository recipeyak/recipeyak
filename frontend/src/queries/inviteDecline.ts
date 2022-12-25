import { useMutation, useQueryClient } from "@tanstack/react-query"

import { declineInvite, IInvite } from "@/api"
import { unwrapResult } from "@/query"

export function useInviteDecline() {
  // TODO: if we delete the current session that should use the logout mutation
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) =>
      declineInvite(inviteId).then(unwrapResult),
    onSuccess: (_response, vars) => {
      queryClient.setQueryData(
        ["invites"],
        (prev: readonly IInvite[] | undefined) => {
          // TODO:
          return prev?.map((x) => {
            if (x.id === vars.inviteId) {
              return { ...x, status: "declined" as const }
            }
            return x
          })
        },
      )
    },
  })
}
