import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

interface IDeleteNote {
  readonly noteId: string
}
const deleteNote = ({ noteId }: IDeleteNote) =>
  http.delete(`/api/v1/notes/${noteId}/`)

export function useNoteDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    // add recipeId so we can easily delete the local cache even though it isn't required by the API
    mutationFn: ({ noteId }: { noteId: string; recipeId: number }) =>
      deleteNote({ noteId }).then(unwrapResult),
    onSuccess: (_res, vars) => {
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: (prev) => {
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
      })
    },
  })
}
