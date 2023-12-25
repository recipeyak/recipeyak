import { useMutation, useQueryClient } from "@tanstack/react-query"
import produce from "immer"

import { http } from "@/http"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
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

const updateRecipe = (id: number, data: unknown) =>
  http.patch<{
    readonly id: number
    readonly name: string
    readonly author: string | null
    readonly source: string | null
    readonly time: string
    readonly servings: string | null
    readonly ingredients: ReadonlyArray<{
      readonly id: number
      readonly quantity: string
      readonly name: string
      readonly description: string
      readonly position: string
      readonly optional: boolean
    }>
    readonly steps: ReadonlyArray<{
      readonly id: number
      readonly text: string
      readonly position: string
    }>
    readonly recentSchedules: ReadonlyArray<{
      readonly id: number
      readonly on: string
    }>
    readonly timelineItems: ReadonlyArray<
      | {
          readonly id: string
          readonly text: string
          readonly created_by: {
            readonly id: number
            readonly name: string
            readonly email: string
            readonly avatar_url: string
          }
          readonly modified: string
          readonly created: string
          readonly attachments: ReadonlyArray<{
            readonly id: string
            readonly url: string
            readonly backgroundUrl: string | null
            readonly contentType: string
            readonly isPrimary: boolean
            readonly type: "upload"
          }>
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
          readonly last_modified_by: {
            readonly id: number
            readonly name: string
            readonly email: string
            readonly avatar_url: string
          } | null
          readonly type: "note"
        }
      | {
          readonly id: number
          readonly type: "recipe"
          readonly action:
            | "created"
            | "archived"
            | "unarchived"
            | "deleted"
            | "scheduled"
            | "remove_primary_image"
            | "set_primary_image"
          readonly created_by: {
            readonly id: number
            readonly name: string
            readonly email: string
            readonly avatar_url: string
          } | null
          readonly is_scraped: boolean
          readonly created: string
        }
    >
    readonly sections: ReadonlyArray<{
      readonly id: number
      readonly title: string
      readonly position: string
    }>
    readonly modified: string
    readonly created: string
    readonly avatar_url: string | null
    readonly tags: ReadonlyArray<string>
    readonly archived_at: string | null
    readonly archivedAt: string | null
    readonly primaryImage: {
      readonly id: string
      readonly url: string
      readonly backgroundUrl: string
      readonly contentType: string
      readonly author: string
    } | null
  }>(`/api/v1/recipes/${id}/`, data)

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
        tags?: readonly string[]
        servings?: string | null
        source?: string | null
        primaryImageId?: string | null
        archived_at?: string | null
      }
    }) => updateRecipe(recipeId, update).then(unwrapResult),
    onMutate: (vars) => {
      if (vars.update.primaryImageId !== undefined) {
        const primaryImageId = vars.update.primaryImageId
        setQueryDataRecipe(queryClient, {
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
      setQueryDataRecipe(queryClient, {
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
        setQueryDataRecipe(queryClient, {
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
  })
}
