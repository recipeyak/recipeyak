import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getRecipeList } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useRecipeList() {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  return useQuery(
    [teamID, "recipes-list"],
    () => getRecipeList().then(unwrapResult),
    {
      onSuccess: (res) => {
        res.forEach((recipe) => {
          queryClient.setQueryData([teamID, "recipes", recipe.id], recipe)
        })
      },
    },
  )
}
