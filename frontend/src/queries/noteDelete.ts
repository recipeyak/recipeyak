import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteNote, IRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

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
