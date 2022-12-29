import { useQuery } from "@tanstack/react-query"

import { recentlyCreatedRecipes } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapEither } from "@/query"

export function useRecentlyCreatedRecipesList() {
  const teamId = useTeamId()
  return useQuery([teamId, "recently-created-recipes"], () =>
    recentlyCreatedRecipes().then(unwrapEither),
  )
}
