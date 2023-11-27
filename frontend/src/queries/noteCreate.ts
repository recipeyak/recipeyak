import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { INote, IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

interface IAddNoteToRecipe {
  readonly recipeId: IRecipe["id"]
  readonly note: string
  readonly attachmentUploadIds: string[]
}
const addNoteToRecipe = ({
  recipeId,
  note,
  attachmentUploadIds,
}: IAddNoteToRecipe) =>
  http.post<INote>(`/api/v1/recipes/${recipeId}/notes/`, {
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
