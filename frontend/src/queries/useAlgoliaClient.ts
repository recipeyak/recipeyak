import {
  MultipleQueriesOptions,
  MultipleQueriesQuery,
  MultipleQueriesResponse,
  SearchForFacetValuesQueryParams,
  SearchForFacetValuesResponse,
  SearchOptions,
} from "@algolia/client-search"
import { RequestOptions } from "@algolia/transporter"
import { useQuery } from "@tanstack/react-query"
import algoliasearch from "algoliasearch"
import { SearchClient } from "algoliasearch/lite"

import { algoliaRetrieve } from "@/api/algoliaRetrieve"

export function useAlgoliaClient(teamId: number) {
  const res = useQuery({
    queryKey: ["algolia", teamId],
    // refetch hourly. Tokens expire after 1 hour.
    staleTime: 50 * 60 * 1000,
    refetchInterval: 25 * 60 * 1000,
    queryFn: async () => {
      const res = await algoliaRetrieve()
      return res
    },
  })

  return {
    async getClient(): Promise<SearchClient> {
      if (res.isStale || res.data == null) {
        const newRes = await res.refetch()
        if (newRes.data == null) {
          throw Error("Should not be null")
        }
        return algoliasearch(newRes.data.app_id, newRes.data.api_key)
      }
      return algoliasearch(res.data.app_id, res.data.api_key)
    },
    async search<TObject>(
      queries: readonly MultipleQueriesQuery[],
      requestOptions?: RequestOptions & MultipleQueriesOptions,
    ): Promise<MultipleQueriesResponse<TObject>> {
      return (await this.getClient()).search(queries, requestOptions)
    },
    async searchForFacetValues(
      queries: ReadonlyArray<{
        readonly indexName: string
        readonly params: SearchForFacetValuesQueryParams & SearchOptions
      }>,
      requestOptions?: RequestOptions,
    ): Promise<readonly SearchForFacetValuesResponse[]> {
      return (await this.getClient()).searchForFacetValues(
        queries,
        requestOptions,
      )
    },
  }
}
