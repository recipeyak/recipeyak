import { QueryClient, useQuery } from "@tanstack/react-query"
import { useChannel } from "ably/react"

import { recipeRetrieve } from "@/api/recipeRetrieve"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"
import { useTeamId } from "@/useTeamId"

export function useRecipeFetch({ recipeId }: { recipeId: number }) {
  const teamId = useTeamId()
  const res = useQuery(recipeQueryOptions({ teamId, recipeId }))
  useChannel(`team:${teamId}:recipe:${recipeId}`, (message) => {
    switch (message.name) {
      case "recipe_modified": {
        void res.refetch()
      }
    }
  })
  return res
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

// Long enough that a hover prefetch followed by navigation doesn't fetch
// twice. Ably pushes `recipe_modified` while the page is open, so this
// doesn't leave the detail page showing stale data.
const STALE_TIME_MS = 10_000

function recipeQueryOptions({
  teamId,
  recipeId,
}: {
  teamId: number
  recipeId: number
}) {
  return {
    queryKey: getQueryKey({ teamId, recipeId }),
    queryFn: () => recipeRetrieve({ recipe_id: recipeId }),
    staleTime: STALE_TIME_MS,
  }
}

export function prefetchRecipe(
  client: QueryClient,
  { teamId, recipeId }: { teamId: number; recipeId: number },
) {
  return client.prefetchQuery(recipeQueryOptions({ teamId, recipeId }))
}

export type RecipeFetchResponse = ResponseFromUse<typeof useRecipeFetch>

export function cacheUpsertRecipe(
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
  // eslint-disable-next-line no-restricted-syntax
  client.setQueryData<RecipeFetchResponse>(
    getQueryKey({ teamId, recipeId }),
    updater,
  )
}
