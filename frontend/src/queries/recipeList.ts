import { useQuery } from "@tanstack/react-query"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { unwrapResult } from "@/query"

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
    onSuccess: () => {
      // NOTE: we don't save all these recipes as it exceeds the localStorage
      // limit of 5MB (we try to save 3MB of data but that ends up being too
      // much for safari.)
    },
  })
}
