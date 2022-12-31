import { useMutation, useQueryClient } from "@tanstack/react-query"

import { IRecipe, updateNote } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

export function useNoteUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      noteId,
      note,
      attachmentUploadIds,
    }: {
      // include recipeId so we can more easily update the local cache
      recipeId: number
      noteId: number
      note: string
      attachmentUploadIds: string[]
    }) => updateNote({ noteId, note, attachmentUploadIds }).then(unwrapResult),
    onSuccess: (res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return {
            ...prev,
            timelineItems: [
              ...prev.timelineItems.filter((x) => x.id !== vars.noteId),
              res,
            ],
          }
        },
      )
    },
  })
}
