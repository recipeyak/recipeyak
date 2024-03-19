import { useQuery } from "@tanstack/react-query"

import { recipeRecentlyViewed } from "@/api/recipeRecentlyViewed"
import { useTeamId } from "@/useTeamId"

export function useRecentlyViewedRecipesList() {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "recently-viewed-recipes"],
    queryFn: () => recipeRecentlyViewed(),
  })
}
