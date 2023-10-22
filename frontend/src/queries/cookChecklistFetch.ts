import { useChannel } from "@ably-labs/react-hooks"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { updateChecklistItemCache } from "@/queries/cookChecklistUpdate"
import { unwrapResult } from "@/query"

export type CookChecklist = Record<string, boolean>

const fetchCookChecklist = (params: { readonly recipeId: number }) => {
  return http.get<CookChecklist>(`/api/v1/cook-checklist/${params.recipeId}/`)
}

type CheckmarkUpdated = {
  ingredientId: number
  checked: boolean
}

export function useCookChecklistFetch({ recipeId }: { recipeId: number }) {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  useChannel(`cook_checklist:${teamID}:${recipeId}`, (message) => {
    switch (message.name) {
      case "checkmark_updated": {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const res: CheckmarkUpdated = JSON.parse(message.data)
        updateChecklistItemCache(res, recipeId, queryClient)
        break
      }
    }
  })

  return useQuery({
    queryKey: ["updateCookChecklist", recipeId],
    queryFn: () => fetchCookChecklist({ recipeId }).then(unwrapResult),
  })
}