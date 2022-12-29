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
        // TODO: this is kind of slow, it takes ~100ms w/ ~400 recipes
        // we either need to prioritize non-recipe list items to save or skip
        // doing this
        res.forEach((recipe) => {
          queryClient.setQueryData([teamID, "recipes", recipe.id], recipe)
        })
      },
    },
  )
}
