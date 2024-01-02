import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useSearchClient } from "@/queries/useSearchClient"
import { useTeamId } from "@/useTeamId"

export function useSearchRecipeFacets({
  facetName,
  facetQuery,
  indexName = "recipes",
}: {
  facetName: string
  facetQuery: string
  indexName?: "recipes" | "ingredients"
}) {
  const searchClient = useSearchClient()
  const teamId = useTeamId()

  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [teamId, "search-facets", indexName, facetName, facetQuery],
    queryFn: () =>
      searchClient?.searchForFacetValues([
        { indexName, params: { facetName, facetQuery } },
      ]),
  })
}
