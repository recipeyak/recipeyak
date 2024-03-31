import { SearchResponse } from "@algolia/client-search"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useAlgoliaContext } from "@/components/algoliaContext"
import { useTeamId } from "@/useTeamId"

export function useSearchRecipes({
  query,
  indexName = "recipes",
  facetFilters = [],
  limit = 20,
}: {
  query: string
  indexName?: "recipes" | "ingredients"
  facetFilters?: Array<string | Array<string>>
  limit?: number
}) {
  const searchClient = useAlgoliaContext()
  const teamId = useTeamId()
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [teamId, "search", indexName, query, facetFilters, limit],
    meta: {
      skipPersistence: true,
    },
    queryFn: () =>
      searchClient.search<{
        readonly id: number
        readonly name: string
        readonly archived_at: string | null
        readonly author: string | null
        readonly ingredients: Array<{ name: string }>
        readonly primary_image: {
          readonly url: string
          readonly background_url: string | null
        } | null
        readonly favorite_by_user_id: ReadonlyArray<number> | null
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
            facetFilters:
              facetFilters?.filter((x) => x !== "archived:false") ?? [],
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
