import { useQuery } from "@tanstack/react-query"

import { getRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useRecipeFetch({ recipeId }: { recipeId: number }) {
  const teamID = useTeamId()
  return useQuery([teamID, "recipes", recipeId], () =>
    getRecipe(recipeId).then(unwrapResult),
  )
}
