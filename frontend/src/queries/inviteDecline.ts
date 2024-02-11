import { useMutation, useQueryClient } from "@tanstack/react-query"

import { inviteDecline } from "@/api/inviteDecline"
import { cacheUpsertInviteList } from "@/queries/inviteList"

export function useInviteDecline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) =>
      inviteDecline({ invite_id: inviteId }),
    onSuccess: (_response, vars) => {
      cacheUpsertInviteList(queryClient, {
        updater: (prev) => {
          return prev?.map((x) => {
            if (x.id === vars.inviteId) {
              return { ...x, status: "declined" as const }
            }
            return x
          })
        },
      })
    },
  })
}
