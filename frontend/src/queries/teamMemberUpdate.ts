import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError, AxiosResponse } from "axios"

import { http } from "@/http"
import { setQueryDataTeamMemberList } from "@/queries/teamMembersList"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"

type Level = "admin" | "contributor" | "read"

const updateTeamMemberLevel = (membershipID: number, level: Level) =>
  http.patch<{
    readonly id: number
    readonly created: string
    readonly level: "admin" | "contributor" | "read"
    readonly user: {
      readonly id: number
      readonly name: string
      readonly avatar_url: string
      readonly email: string
    }
  }>(`/api/v1/members/${membershipID}/`, { level })

export function useTeamMemberUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      memberId,
      level,
    }: {
      teamId: number
      memberId: number
      level: "admin" | "contributor" | "read"
    }) => updateTeamMemberLevel(memberId, level).then(unwrapResult),
    onMutate: (vars) => {
      let prevLevel: Level | undefined
      setQueryDataTeamMemberList(queryClient, {
        teamId: vars.teamId,
        updater: (prev) => {
          return prev?.map((x) => {
            if (x.id === vars.memberId) {
              prevLevel = x.level
              return { ...x, level: vars.level }
            }
            return x
          })
        },
      })
      // TODO: ban
      // queryClient.setQueryData<IMember[]>(
      return { prevLevel }
    },
    onSuccess: (res, vars) => {
      setQueryDataTeamMemberList(queryClient, {
        teamId: vars.teamId,
        updater: (prev) => {
          return prev?.map((x) => {
            if (x.id === vars.memberId) {
              return res
            }
            return x
          })
        },
      })
    },
    onError: (error, vars, context) => {
      setQueryDataTeamMemberList(queryClient, {
        teamId: vars.teamId,
        updater: (prev) => {
          return prev?.map((x) => {
            if (x.id === vars.memberId && context?.prevLevel != null) {
              return { ...x, level: context.prevLevel }
            }
            return x
          })
        },
      })

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment
      const err = error as AxiosError | undefined
      if (err == null) {
        return {}
      }
      if (err.response && attemptedDeleteLastAdmin(err.response)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const message: string = err.response.data.level[0]
        toast.error(message)
      }
    },
  })
}

const attemptedDeleteLastAdmin = (res: AxiosResponse) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  res.status === 400 &&
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  res.data.level?.[0].includes("cannot demote")
