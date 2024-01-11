import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/http"
import { setQueryDataRecipe } from "@/queries/recipeFetch"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const createRecipe = (
  recipe:
    | {
        readonly team: number | undefined
        readonly name: string
      }
    | { readonly team: number | undefined; readonly from_url: string },
) =>
  http.post<{
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
  }>("/api/v1/recipes/", recipe)

export function useRecipeCreate() {
  const queryClient = useQueryClient()
  const teamId = useTeamId()
  return useMutation({
    mutationFn: (
      payload:
        | {
            from_url: string
          }
        | {
            name: string
          },
    ) => {
      const team = teamId
      const data =
        "from_url" in payload
          ? {
              team,
              from_url: payload.from_url,
            }
          : {
              team,
              name: payload.name,
            }
      return createRecipe(data).then(unwrapResult)
    },
    onSuccess: (res) => {
      setQueryDataRecipe(queryClient, {
        teamId,
        recipeId: res.id,
        updater: () => {
          return res
        },
      })
    },
  })
}
