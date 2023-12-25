import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"

const sendTeamInvites = (
  teamID: number,
  emails: string[],
  level: "admin" | "contributor" | "read",
) => http.post<void>(`/api/v1/t/${teamID}/invites/`, { emails, level })

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
