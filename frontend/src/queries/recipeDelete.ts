import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useHistory } from "react-router"

import { deleteRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { pathRecipesList } from "@/paths"
import { unwrapResult } from "@/query"

export function useRecipeDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  const history = useHistory()
  return useMutation({
    mutationFn: ({ recipeId }: { recipeId: number }) =>
      deleteRecipe(recipeId).then(unwrapResult),
    onSuccess: (_res, vars) => {
      history.push(pathRecipesList({}))
      queryClient.removeQueries([teamId, "recipes", vars.recipeId])
    },
  })
}
