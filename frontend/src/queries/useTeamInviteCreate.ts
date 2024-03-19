import { useMutation } from "@tanstack/react-query"

import { inviteCreate } from "@/api/inviteCreate"
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
    }) => inviteCreate({ team_id: teamId, emails, level }),
    onSuccess: () => {
      toast.success("invites sent!")
    },
    onError: () => {
      toast.error("error sending team invite")
    },
  })
}
