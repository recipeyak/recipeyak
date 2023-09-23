import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useTeamId } from "@/hooks"
import { http } from "@/http"
import { IRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"

interface IDeleteNote {
  readonly noteId: number
}
const deleteNote = ({ noteId }: IDeleteNote) =>
  http.delete(`/api/v1/notes/${noteId}/`)

export function useNoteDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    // add recipeId so we can easily delete the local cache even though it isn't required by the API
    mutationFn: ({ noteId }: { noteId: number; recipeId: number }) =>
      deleteNote({ noteId }).then(unwrapResult),
    onSuccess: (_res, vars) => {
      queryClient.setQueryData<IRecipe>(
        [teamId, "recipes", vars.recipeId],
        (prev) => {
          if (prev == null) {
            return prev
          }
          return {
            ...prev,
            timelineItems: prev.timelineItems.filter(
              (x) => x.id !== vars.noteId,
            ),
          }
        },
      )
    },
  })
}
