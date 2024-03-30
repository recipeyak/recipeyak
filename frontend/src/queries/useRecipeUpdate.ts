import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { recipeUpdate } from "@/api/recipeUpdate"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"
import { cacheUpsertRecipe } from "@/queries/useRecipeFetch"
import { useTeamId } from "@/useTeamId"

type Recipe = ResponseFromUse<typeof useRecipeUpdate>

function toggleImageStar(
  prev: Recipe,
  /** null unsets the primarImageId */
  primaryImageId: string | null,
): Recipe {
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
function toggleUserFavorite(prev: Recipe, user_favorite: boolean): Recipe {
  return produce(prev, (recipe) => {
    recipe.user_favorite = user_favorite
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
        time?: string | null
        tags?: readonly string[] | null
        servings?: string | null
        source?: string | null
        primaryImageId?: string | null
        archived_at?: Date | null
        user_favorite?: boolean | null
      }
    }) => recipeUpdate({ recipe_id: recipeId, ...update }),
    onMutate: (vars) => {
      if (vars.update.user_favorite != null) {
        const userFavorite = vars.update.user_favorite
        cacheUpsertRecipe(queryClient, {
          teamId,
          recipeId: vars.recipeId,
          updater: (prev) => {
            if (prev == null) {
              return prev
            }
            return toggleUserFavorite(prev, userFavorite)
          },
        })
      }
      if (vars.update.primaryImageId !== undefined) {
        const primaryImageId = vars.update.primaryImageId
        cacheUpsertRecipe(queryClient, {
          teamId,
          recipeId: vars.recipeId,
          updater: (prev) => {
            if (prev == null) {
              return prev
            }
            return toggleImageStar(prev, primaryImageId)
          },
        })
      }
    },
    onSuccess: (res, vars) => {
      cacheUpsertRecipe(queryClient, {
        teamId,
        recipeId: vars.recipeId,
        updater: () => {
          return res
        },
      })
    },
    onError: (_error, vars) => {
      // Feel like we'd need transactions ids essentially to make this fool proof, because you could have concurrent requests to update the star
      if (vars.update.primaryImageId !== undefined) {
        const primaryImageId = vars.update.primaryImageId
        cacheUpsertRecipe(queryClient, {
          teamId,
          recipeId: vars.recipeId,
          updater: (prev) => {
            if (prev == null) {
              return prev
            }
            return toggleImageStar(prev, primaryImageId)
          },
        })
      }
      if (vars.update.user_favorite != null) {
        const userFavorite = vars.update.user_favorite
        cacheUpsertRecipe(queryClient, {
          teamId,
          recipeId: vars.recipeId,
          updater: (prev) => {
            if (prev == null) {
              return prev
            }
            return toggleUserFavorite(prev, userFavorite)
          },
        })
      }
    },
  })
}
