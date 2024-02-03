import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useChannel } from "ably/react"

import { cookChecklistRetrieve } from "@/api/cookChecklistRetrieve"
import { updateChecklistItemCache } from "@/queries/cookChecklistUpdate"
import { useTeamId } from "@/useTeamId"

export type CookChecklist = Record<string, boolean>

type CheckmarkUpdated = {
  ingredientId: number
  checked: boolean
}

export function useCookChecklistFetch({ recipeId }: { recipeId: number }) {
  const teamID = useTeamId()
  const queryClient = useQueryClient()
  useChannel(`team:${teamID}:cook_checklist:${recipeId}`, (message) => {
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
