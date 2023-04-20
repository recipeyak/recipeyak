import { useQuery } from "@tanstack/react-query"

import { recentlyCreatedRecipes } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

export function useRecentlyCreatedRecipesList() {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "recently-created-recipes"],
    queryFn: () => recentlyCreatedRecipes().then(unwrapEither),
  })
}
