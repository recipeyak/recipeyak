import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { setQueryDataInviteList } from "@/queries/inviteList"
import { unwrapResult } from "@/query"

const acceptInvite = (id: number) => http.post(`/api/v1/invites/${id}/accept/`)

export function useInviteAccept() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) =>
      acceptInvite(inviteId).then(unwrapResult),
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
