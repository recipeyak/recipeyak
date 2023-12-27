import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

export type RecipeListItem = {
  readonly id: number
  readonly name: string
  readonly author: string | null
  readonly tags: readonly string[] | null
  readonly ingredients: readonly {
    id: number
    quantity: string
    name: string
  }[]
  readonly archived_at: string | null
  readonly primaryImage: {
    id: number
    url: string
    backgroundUrl: string | null
  } | null
  readonly scheduledCount: number
}

const getRecipeList = () => {
  return http.get<RecipeListItem[]>("/api/v1/recipes/")
}

export function useRecipeList() {
  const teamID = useTeamId()
  return useQuery({
    queryKey: [teamID, "recipes-list"],
    queryFn: () => getRecipeList().then(unwrapResult),
  })
}
