import { useQuery } from "@tanstack/react-query"

import { recentlyCreatedRecipes } from "@/api"
import { unwrapEither } from "@/query"

export function useRecentlyCreatedRecipesList() {
  return useQuery(["recently-created-recipes"], () =>
    recentlyCreatedRecipes().then(unwrapEither),
  )
}
