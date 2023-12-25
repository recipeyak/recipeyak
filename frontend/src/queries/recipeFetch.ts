import { QueryClient, useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { ResponseFromUse, ResponseFromUseQuery } from "@/queries/queryUtilTypes"
import { unwrapResult } from "@/query"
import { useTeamId } from "@/useTeamId"

const getRecipe = (id: number) =>
  http.get<{
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
  }>(`/api/v1/recipes/${id}/`)

export function useRecipeFetch({ recipeId }: { recipeId: number }) {
  const teamId = useTeamId()
  return useQuery({
    queryKey: getQueryKey({ teamId, recipeId }),
    queryFn: () => getRecipe(recipeId).then(unwrapResult),
  })
}

function getQueryKey({
  teamId,
  recipeId,
}: {
  teamId: number
  recipeId: number
}) {
  return [teamId, "recipes", recipeId]
}

export type RecipeFetchResponse = ResponseFromUse<typeof useRecipeFetch>

export function setQueryDataRecipe(
  client: QueryClient,
  {
    updater,
    teamId,
    recipeId,
  }: {
    teamId: number
    recipeId: number
    updater: (
      prev: RecipeFetchResponse | undefined,
    ) => RecipeFetchResponse | undefined
  },
) {
  client.setQueryData<RecipeFetchResponse>(
    getQueryKey({ teamId, recipeId }),
    updater,
  )
}
