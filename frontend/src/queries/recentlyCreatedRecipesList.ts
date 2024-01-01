import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

function recentlyCreatedRecipes() {
  return http.get<
    Array<{
      id: number
      name: string
      author: string | null
      archivedAt: string | null
      primaryImage: {
        id: number
        url: string
        backgroundUrl: string | null
      } | null
      createdBy: {
        id: number
        name: string
        avatarUrl: string | null
      } | null
    }>
  >("/api/v1/recipes/recently_created")
}

export function useRecentlyCreatedRecipesList() {
  const teamId = useTeamId()
  return useQuery({
    queryKey: [teamId, "recently-created-recipes"],
    queryFn: () => recentlyCreatedRecipes().then(unwrapResult),
  })
}
