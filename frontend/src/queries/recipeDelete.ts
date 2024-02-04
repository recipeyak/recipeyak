import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useHistory } from "react-router"

import { recipeDelete } from "@/api/recipeDelete"
import { pathRecipesList } from "@/paths"
import { useTeamId } from "@/useTeamId"

export function useRecipeDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  const history = useHistory()
  return useMutation({
    mutationFn: ({ recipeId }: { recipeId: number }) =>
      recipeDelete({ recipe_id: recipeId }),
    onSuccess: (_res, vars) => {
      history.push(pathRecipesList({}))
      queryClient.removeQueries({
        queryKey: [teamId, "recipes", vars.recipeId],
      })
    },
  })
}
