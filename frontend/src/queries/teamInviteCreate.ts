import { useMutation } from "@tanstack/react-query"

import { sendTeamInvites } from "@/api"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"

export function useTeamInviteCreate() {
  return useMutation({
    mutationFn: ({
      teamId,
      emails,
      level,
    }: {
      teamId: number
      emails: string[]
      level: "admin" | "contributor" | "read"
    }) => sendTeamInvites(teamId, emails, level).then(unwrapResult),
    onSuccess: () => {
      toast.success("invites sent!")
    },
    onError: () => {
      toast.error("error sending team invite")
    },
  })
}
