import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useHistory } from "react-router"

import { http } from "@/http"
import { pathTeamDetail } from "@/paths"
import { setQueryDataTeam } from "@/queries/teamFetch"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"

const createTeam = (
  name: string,
  emails: string[],
  level: "admin" | "contributor" | "read",
) =>
  http.post<{ id: number; name: string }>("/api/v1/t/", { name, emails, level })

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
    }) => createTeam(name, emails, level).then(unwrapResult),
    onSuccess: (res) => {
      setQueryDataTeam(queryClient, {
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
