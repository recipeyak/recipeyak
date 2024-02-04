import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { teamUpdate } from "@/api/teamUpdate"
import { setQueryDataTeam } from "@/queries/teamFetch"
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
    }) => teamUpdate({ name: payload.name, team_id: teamId }),
    onSuccess: (res, vars) => {
      toast.success("Team updated")
      setQueryDataTeam(queryClient, { teamId: vars.teamId, updater: () => res })
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
