import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

interface IUpdateNote {
  readonly noteId: string
  readonly note: string
  readonly attachmentUploadIds: string[]
}
const updateNote = ({ noteId, note, attachmentUploadIds }: IUpdateNote) =>
  http.patch<{
    readonly id: string
    readonly type: "note"
    readonly text: string
    readonly created_by: {
      readonly id: number
      readonly name: string
      readonly email: string
      readonly avatar_url: string
    }
    readonly last_modified_by: {
      readonly id: number
      readonly name: string
      readonly email: string
      readonly avatar_url: string
    } | null
    readonly created: string
    readonly reactions: ReadonlyArray<{
      readonly id: string
      readonly type: "❤️" | "😆" | "🤮"
      readonly note_id: number
      readonly user: {
        readonly id: number
        readonly name: string
        readonly email: string
        readonly avatar_url: string
      }
      readonly created: string
    }>
    readonly attachments: ReadonlyArray<{
      readonly id: string
      readonly url: string
      readonly backgroundUrl: string
      readonly isPrimary: boolean
      readonly contentType: string
      readonly type: "upload"
    }>
    readonly modified: string
  }>(`/api/v1/notes/${noteId}/`, {
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
      noteId: string
      note: string
      attachmentUploadIds: string[]
    }) => updateNote({ noteId, note, attachmentUploadIds }).then(unwrapResult),
    onSuccess: (res, vars) => {
      setQueryDataRecipe(queryClient, {
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
