import { useQuery } from "@tanstack/react-query"

import { recipeRecentlyCreated } from "@/api/recipeRecentlyCreated"
import { useTeamId } from "@/useTeamId"

export function useRecentlyCreatedRecipesList() {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "recently-created-recipes"],
    queryFn: () => recipeRecentlyCreated(),
  })
}
