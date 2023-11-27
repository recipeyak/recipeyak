import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { INote, IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

interface IUpdateNote {
  readonly noteId: INote["id"]
  readonly note: string
  readonly attachmentUploadIds: string[]
}
const updateNote = ({ noteId, note, attachmentUploadIds }: IUpdateNote) =>
  http.patch<INote>(`/api/v1/notes/${noteId}/`, {
    text: note,
    attachment_upload_ids: attachmentUploadIds,
  })

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
