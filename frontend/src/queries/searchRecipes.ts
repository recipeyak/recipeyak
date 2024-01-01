import { SearchResponse } from "@algolia/client-search"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useSearchClient } from "@/queries/useSearchClient"

export function useSearchQuery(query: string) {
  const searchClient = useSearchClient()
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["search", query],
    queryFn: () =>
      searchClient?.search<{
        readonly id: number
        readonly name: string
        readonly archived_at: string | null
        readonly author: string | null
        readonly primary_image: {
          readonly url: string
          readonly background_url: string | null
        } | null
      }>([{ indexName: "recipes", query }]),
    select: (result) => {
      if (result == null) {
        return result
      }
      const data = result.results[0]
      if ("hits" in data) {
        return {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          result: data as SearchResponse,
          hits: data.hits.map((h) => {
            return {
              id: h.id,
              name: h.name,
              author: h.author,
              primary_image: h.primary_image,
            }
          }),
        }
      } else {
        return null
      }
    },
  })
}
