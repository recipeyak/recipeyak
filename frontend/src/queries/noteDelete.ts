import { useMutation, useQueryClient } from "@tanstack/react-query"

import { noteDelete } from "@/api/noteDelete"
import { cacheUpsertRecipe } from "@/queries/recipeFetch"
import { useTeamId } from "@/useTeamId"

export function useNoteDelete() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    // add recipeId so we can easily delete the local cache even though it isn't required by the API
    mutationFn: ({ noteId }: { noteId: string; recipeId: number }) =>
      noteDelete({ note_id: noteId }),
    onSuccess: (_res, vars) => {
      cacheUpsertRecipe(queryClient, {
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
