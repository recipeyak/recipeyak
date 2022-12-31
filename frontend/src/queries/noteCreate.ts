import { useMutation, useQueryClient } from "@tanstack/react-query"

import { addNoteToRecipe, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

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
      addNoteToRecipe({ recipeId, note, attachmentUploadIds: uploadIds }).then(
        unwrapResult,
      ),
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return {
            ...prev,
            timelineItems: [...prev.timelineItems, res],
          }
        },
      )
    },
  })
}
