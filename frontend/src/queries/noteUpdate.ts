import { useMutation, useQueryClient } from "@tanstack/react-query"

import { noteUpdate } from "@/api/noteUpdate"
import { cacheUpsertRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

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
      noteId: string
      note: string
      attachmentUploadIds: string[]
    }) =>
      noteUpdate({
        note_id: noteId,
        text: note,
        attachment_upload_ids: attachmentUploadIds,
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
            timelineItems: [
              ...prev.timelineItems.filter((x) => x.id !== vars.noteId),
              res,
            ],
          }
        },
      })
    },
  })
}
