import { useQuery } from "@tanstack/react-query"

import { cookChecklistRetrieve } from "@/api/cookChecklistRetrieve"

export function useCookChecklistFetch({ recipeId }: { recipeId: number }) {
  return useQuery({
    queryKey: ["updateCookChecklist", recipeId],
    queryFn: () => cookChecklistRetrieve({ recipe_id: recipeId }),
  })
}
