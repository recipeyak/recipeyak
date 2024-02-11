import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useHistory } from "react-router"

import { teamCreate } from "@/api/teamCreate"
import { pathTeamDetail } from "@/paths"
import { cacheUpsertTeam } from "@/queries/teamFetch"
import { toast } from "@/toast"

export function useTeamCreate() {
  const queryClient = useQueryClient()
  const history = useHistory()
  return useMutation({
    mutationFn: ({
      name,
      emails,
      level,
    }: {
      name: string
      emails: string[]
      level: "admin" | "contributor" | "read"
    }) => teamCreate({ name, emails, level }),
    onSuccess: (res) => {
      cacheUpsertTeam(queryClient, {
        teamId: res.id,
        updater: () => {
          return res
        },
      })
      toast.success("Team updated")
      history.push(pathTeamDetail({ teamId: res.id.toString() }))
    },
    onError: (res) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const err = res as AxiosError | undefined
      if (err == null) {
        return
      }
      let message = "Problem creating team."
      if (err?.response?.status === 403) {
        message = "You are not authorized to perform that action"
      }
      toast.error(message)
    },
  })
}
