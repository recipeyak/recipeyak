import { useMutation, useQueryClient } from "@tanstack/react-query"

import { inviteAccept } from "@/api/inviteAccept"
import { setQueryDataInviteList } from "@/queries/inviteList"

export function useInviteAccept() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) =>
      inviteAccept({ invite_id: inviteId }),
    onSuccess: (_response, vars) => {
      setQueryDataInviteList(queryClient, {
        updater: (prev) => {
          return prev?.map((x) => {
            if (x.id === vars.inviteId) {
              return { ...x, status: "accepted" as const }
            }
            return x
          })
        },
      })
    },
  })
}
