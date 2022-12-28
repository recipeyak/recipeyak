import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { updateTeam } from "@/api"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"

export function useTeamUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: number
      payload: { name: string }
    }) => updateTeam(teamId, payload).then(unwrapResult),
    onSuccess: (res, vars) => {
      toast.success("Team updated")
      queryClient.setQueryData(["teams", vars.teamId], () => {
        return res
      })
    },
    onError: (res) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const err = res as AxiosError | undefined
      if (err == null) {
        return
      }
      let message = "Problem updating team."
      if (err?.response?.status === 403) {
        message = "You are not authorized to perform that action"
      }
      toast.error(message)
    },
  })
}
