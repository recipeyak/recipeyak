import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

export type CookChecklist = Record<string, boolean>

const fetchCookChecklist = (params: { readonly recipeId: number }) => {
  return http.get<CookChecklist>(`/api/v1/cook-checklist/${params.recipeId}/`)
}

export function useCookChecklistFetch({ recipeId }: { recipeId: number }) {
  return useQuery({
    queryKey: ["updateCookChecklist", recipeId],
    queryFn: () => fetchCookChecklist({ recipeId }).then(unwrapResult),
  })
}
