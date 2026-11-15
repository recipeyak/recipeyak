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
      // Persist the "browse" queries (no search text) so pages like /recipes
      // can render cached results immediately on load. Skip persisting
      // free-text searches so we don't store a result set per keystroke.
      skipPersistence: query.trim() !== "",
    },
    queryFn: () =>
      searchClient.search<{
        readonly id: number
        readonly name: string
        readonly archived_at: string | null
        readonly author: string | null
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
            // Only fetch what the UI renders. Records also include the full
            // ingredient list, which is by far the bulk of the payload.
            attributesToRetrieve: [
              "id",
              "name",
              "author",
              "archived_at",
              "primary_image.url",
              "primary_image.background_url",
            ],
            // Highlights are only useful when there's search text. Ingredient
            // highlights are how we show which ingredients matched.
            attributesToHighlight:
              query.trim() === "" ? [] : ["name", "author", "ingredients.name"],
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
            attributesToRetrieve: [],
            attributesToHighlight: [],
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
