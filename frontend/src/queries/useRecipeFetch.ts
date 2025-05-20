import { QueryClient, useQuery } from "@tanstack/react-query"
import { useChannel } from "ably/react"

import { recipeRetrieve } from "@/api/recipeRetrieve"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"
import { useTeamId } from "@/useTeamId"

export function useRecipeFetch({ recipeId }: { recipeId: number }) {
  const teamId = useTeamId()
  const res = useQuery({
    queryKey: getQueryKey({ teamId, recipeId }),
    queryFn: () => recipeRetrieve({ recipe_id: recipeId }),
  })
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
