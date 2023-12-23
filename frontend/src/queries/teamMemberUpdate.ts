import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError, AxiosResponse } from "axios"

import { http } from "@/http"
import { IMember, ITeam } from "@/queries/teamFetch"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"

type Level = "admin" | "contributor" | "read"

const updateTeamMemberLevel = (
  teamID: ITeam["id"],
  membershipID: IMember["id"],
  level: IMember["level"],
) =>
  http.patch<IMember>(`/api/v1/t/${teamID}/members/${membershipID}/`, { level })

export function useTeamMemberUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      memberId,
      level,
    }: {
      teamId: number
      memberId: number
      level: "admin" | "contributor" | "read"
    }) => updateTeamMemberLevel(teamId, memberId, level).then(unwrapResult),
    onMutate: (vars) => {
      let prevLevel: Level | undefined
      queryClient.setQueryData<IMember[]>(
        [vars.teamId, "team-members-list"],
        (prev) => {
          return prev?.map((x) => {
            if (x.id === vars.memberId) {
              prevLevel = x.level
              return { ...x, level: vars.level }
            }
            return x
          })
        },
      )
      return { prevLevel }
    },
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IMember[]>(
        [vars.teamId, "team-members-list"],
        (prev) => {
          return prev?.map((x) => {
            if (x.id === vars.memberId) {
              return res
            }
            return x
          })
        },
      )
    },
    onError: (error, vars, context) => {
      queryClient.setQueryData<IMember[]>(
        [vars.teamId, "team-members-list"],
        (prev) => {
          return prev?.map((x) => {
            if (x.id === vars.memberId && context?.prevLevel != null) {
              return { ...x, level: context.prevLevel }
            }
            return x
          })
        },
      )

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
