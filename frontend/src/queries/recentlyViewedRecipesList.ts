import { useQuery } from "@tanstack/react-query"

import { recentlyViewedRecipes } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

export function useRecentlyViewedRecipesList() {
  const teamId = useTeamId()
  return useQuery([teamId, "recently-viewed-recipes"], () =>
    recentlyViewedRecipes().then(unwrapEither),
  )
}
