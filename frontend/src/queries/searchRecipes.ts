import { SearchOptions, SearchResponse } from "@algolia/client-search"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useSearchClient } from "@/queries/useSearchClient"
import { useTeamId } from "@/useTeamId"

export function useSearchRecipes({
  query,
  indexName = "recipes",
  facetFilters,
  limit,
}: {
  query: string
  indexName?: "recipes" | "ingredients"
  facetFilters?: SearchOptions["facetFilters"]
  limit?: number
}) {
  const searchClient = useSearchClient()
  const teamId = useTeamId()
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [teamId, "search", indexName, query, facetFilters, limit],
    meta: {
      skipPersistence: true,
    },
    queryFn: () =>
      searchClient?.search<{
        readonly id: number
        readonly name: string
        readonly archived_at: string | null
        readonly author: string | null
        readonly ingredients: Array<{ name: string }>
        readonly primary_image: {
          readonly url: string
          readonly background_url: string | null
        } | null
      }>([
        {
          indexName,
          params: {
            filters: `team_id:${teamId}`,
            // TODO: we don't always need to query for facets
            facets: ["archived", "scheduled_count_all_time", "tags"],
            highlightPreTag: "<mark>",
            highlightPostTag: "</mark>",
            hitsPerPage: limit,
            maxValuesPerFacet: 5,
            query,
            facetFilters,
          },
        },
        {
          indexName,
          params: {
            filters: `team_id:${teamId}`,
            facets: ["archived"],
            facetFilters: [["archived:false", "archived:true"]],
            hitsPerPage: 0,
            page: 0,
            query,
            maxValuesPerFacet: 5,
          },
        },
      ]),
    select: (result) => {
      if (result == null) {
        return result
      }
      const hitResults = result.results[0]
      const archivedFacetData = result.results[1]
      if ("hits" in hitResults && "hits" in archivedFacetData) {
        return {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          result: hitResults as SearchResponse,
          hits: hitResults.hits,
          archivedFacetData,
        }
      } else {
        return null
      }
    },
  })
}
