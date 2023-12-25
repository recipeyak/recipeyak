import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const addNoteToRecipe = ({
  recipeId,
  note,
  attachmentUploadIds,
}: {
  readonly recipeId: number
  readonly note: string
  readonly attachmentUploadIds: string[]
}) =>
  http.post<{
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
  }>(`/api/v1/recipes/${recipeId}/notes/`, {
    text: note,
    attachment_upload_ids: attachmentUploadIds,
  })

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
      setQueryDataRecipe(queryClient, {
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
