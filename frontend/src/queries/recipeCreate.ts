import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createRecipe, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useRecipeCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: (
      payload:
        | {
            from_url: string
          }
        | {
            name: string
          },
    ) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const team = teamId as number
      const data =
        "from_url" in payload
          ? {
              team,
              from_url: payload.from_url,
            }
          : {
              team,
              name: payload.name,
            }
      return createRecipe(data).then(unwrapResult)
    },
    onSuccess: (res) => {
      // TODO: might want to update the list view cache
      queryClient.setQueryData([teamId, "recipes", res.id], (): IRecipe => {
        return res
      })
    },
  })
}
