import * as Sentry from "@sentry/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useHistory } from "react-router"

import { http } from "@/http"
import { pathHome } from "@/paths"
import { ITeam } from "@/queries/teamFetch"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"

const deleteTeam = (teamID: ITeam["id"]) => http.delete(`/api/v1/t/${teamID}`)

export function useTeamDelete() {
  const history = useHistory()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId }: { teamId: number }) =>
      deleteTeam(teamId).then(unwrapResult),
    onSuccess: (_res, vars) => {
      history.push(pathHome({}))
      toast.success(`Team deleted`)
      queryClient.removeQueries({
        queryKey: ["teams", vars.teamId],
      })
    },
    onError: (res) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment
      const err = res as AxiosError | undefined
      let message = "Uh Oh! Something went wrong."

      if (err?.response?.status === 403) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message = err.response.data?.detail
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            err.response.data.detail
          : "You are not authorized to delete this team"
      } else if (err?.response?.status === 404) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message = err.response.data?.detail
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            err.response.data.detail
          : "The team you are attempting to delete doesn't exist"
      } else {
        Sentry.captureException(err)
      }
      toast.error(message)
    },
  })
}
