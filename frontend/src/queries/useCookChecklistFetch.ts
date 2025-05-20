import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useChannel } from "ably/react"

import { cookChecklistRetrieve } from "@/api/cookChecklistRetrieve"
import { updateChecklistItemCache } from "@/queries/useCookChecklistUpdate"
import { useTeamId } from "@/useTeamId"

type CheckmarkUpdated = {
  ingredientId: number
  checked: boolean
}

export function useCookChecklistFetch({ recipeId }: { recipeId: number }) {
  const teamId = useTeamId()
  const queryClient = useQueryClient()
  useChannel(`team:${teamId}:cook_checklist:${recipeId}`, (message) => {
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
    queryFn: () => cookChecklistRetrieve({ recipe_id: recipeId }),
  })
}
