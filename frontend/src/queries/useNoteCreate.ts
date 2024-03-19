import { useMutation, useQueryClient } from "@tanstack/react-query"

import { noteCreate } from "@/api/noteCreate"
import { cacheUpsertRecipe } from "@/queries/useRecipeFetch"
import { useTeamId } from "@/useTeamId"

export function useNoteCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
      note,
      uploadIds,
    }: {
      recipeId: number
      note: string
      uploadIds: string[]
    }) =>
      noteCreate({
        recipe_id: recipeId,
        text: note,
        attachment_upload_ids: uploadIds,
      }),
    onSuccess: (res, vars) => {
      cacheUpsertRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
          if (prev == null) {
            return prev
          }
          return {
            ...prev,
            timelineItems: [...prev.timelineItems, res],
          }
        },
      })
    },
  })
}
