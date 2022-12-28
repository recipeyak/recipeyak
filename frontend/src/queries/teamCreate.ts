import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useHistory } from "react-router"

import { createTeam } from "@/api"
import { unwrapResult } from "@/query"
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
    }) => createTeam(name, emails, level).then(unwrapResult),
    onSuccess: (res) => {
      queryClient.setQueryData(["teams", res.id], () => {
        return res
      })
      toast.success("Team updated")
      history.push(`/t/${res.id}`)
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
