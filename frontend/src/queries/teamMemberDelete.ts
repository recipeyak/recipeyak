import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { deleteTeamMember, IMember } from "@/api"
import { unwrapResult } from "@/query"
import { toast } from "@/toast"

export function useTeamMemberDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: number; memberId: number }) =>
      deleteTeamMember(teamId, memberId).then(unwrapResult),
    onSuccess: (_res, vars) => {
      queryClient.setQueryData(
        ["team-members-list", vars.teamId],
        (prev: IMember[] | undefined): IMember[] | undefined => {
          return prev?.filter((x) => x.id !== vars.memberId)
        },
      )
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment
      const err = error as AxiosError | undefined
      if (err == null) {
        return {}
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message: string = err.response?.data
      toast.error(message)
    },
  })
}
