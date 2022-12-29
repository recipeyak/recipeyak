import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { IRecipe, updateRecipe } from "@/api"
import { useTeamId } from "@/hooks"
import { unwrapResult } from "@/query"

function toggleImageStar(
  prev: IRecipe,
  /** null unsets the primarImageId */
  primaryImageId: string | null,
): IRecipe {
  return produce(prev, (recipe) => {
    recipe.timelineItems.forEach((timelineItem) => {
      if (timelineItem.type === "note") {
        timelineItem.attachments.forEach((attachment) => {
          if (primaryImageId == null) {
            // null unsets
            attachment.isPrimary = false
          } else if (attachment.id === primaryImageId) {
            // otherwise we toggle
            attachment.isPrimary = !attachment.isPrimary
          }
        })
      }
    })
  })
}

export function useRecipeUpdate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: ({
      recipeId,
      update,
    }: {
      recipeId: number
      update: {
        name?: string
        author?: string | null
        time?: string
        tags?: string[]
        servings?: string | null
        source?: string | null
        primaryImageId?: string | null
        archived_at?: string | null
      }
    }) => updateRecipe(recipeId, update).then(unwrapResult),
    onMutate: (vars) => {
      if (vars.update.primaryImageId !== undefined) {
        const primaryImageId = vars.update.primaryImageId
        // TODO: might want to update the list view cache
        queryClient.setQueryData(
          [teamId, "recipes", vars.recipeId],
          (prev: IRecipe | undefined): IRecipe | undefined => {
            if (prev == null) {
              return prev
            }
            return toggleImageStar(prev, primaryImageId)
          },
        )
      }
    },
    onSuccess: (res, vars) => {
      // TODO: might want to update the list view cache
      queryClient.setQueryData(
        [teamId, "recipes", vars.recipeId],
        (): IRecipe => {
          return res
        },
      )
    },
    onError: (_error, vars) => {
      // Feel like we'd need transactions ids essentially to make this fool proof, because you could have concurrent requests to update the star
      if (vars.update.primaryImageId !== undefined) {
        const primaryImageId = vars.update.primaryImageId
        // TODO: might want to update the list view cache
        queryClient.setQueryData(
          [teamId, "recipes", vars.recipeId],
          (prev: IRecipe | undefined): IRecipe | undefined => {
            if (prev == null) {
              return prev
            }
            return toggleImageStar(prev, primaryImageId)
          },
        )
      }
    },
  })
}
