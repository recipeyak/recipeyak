import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteLoggedInUser } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useUserDelete() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteLoggedInUser().then(unwrapResult),
  })
}
