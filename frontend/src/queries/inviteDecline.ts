import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { setQueryDataInviteList } from "@/queries/inviteList"
import { unwrapResult } from "@/query"

const declineInvite = (id: number) =>
  http.post<void>(`/api/v1/invites/${id}/decline/`, {})

export function useInviteDecline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) =>
      declineInvite(inviteId).then(unwrapResult),
    onSuccess: (_response, vars) => {
      setQueryDataInviteList(queryClient, {
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
