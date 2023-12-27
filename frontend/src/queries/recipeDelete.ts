import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useHistory } from "react-router"

import { http } from "@/http"
import { pathRecipesList } from "@/paths"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const deleteRecipe = (id: number) => http.delete(`/api/v1/recipes/${id}/`)

export function useRecipeDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  const history = useHistory()
  return useMutation({
    mutationFn: ({ recipeId }: { recipeId: number }) =>
      deleteRecipe(recipeId).then(unwrapResult),
    onSuccess: (_res, vars) => {
      history.push(pathRecipesList({}))
      queryClient.removeQueries({
        queryKey: [teamId, "recipes", vars.recipeId],
      })
    },
  })
}
