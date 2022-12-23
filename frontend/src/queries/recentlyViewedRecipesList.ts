import { useQuery } from "@tanstack/react-query"

import { recentlyViewedRecipes } from "@/api"
import { unwrapEither } from "@/query"

export function useRecentlyViewedRecipesList() {
  return useQuery(["recently-viewed-recipes"], () =>
    recentlyViewedRecipes().then(unwrapEither),
  )
}
