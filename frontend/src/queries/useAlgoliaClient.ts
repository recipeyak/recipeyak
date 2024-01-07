import { useQuery } from "@tanstack/react-query"
import algoliasearch from "algoliasearch"

import { http } from "@/http"
import { unwrapResult } from "@/query"

const getAlgoliaApiKey = () =>
  http.get<{
    readonly app_id: string
    readonly api_key: string
  }>(`/api/v1/auth/algolia/`)

export function useAlgoliaClient(teamId: number) {
  return useQuery({
    queryKey: ["algolia", teamId],
    // refetch hourly. Tokens expire after 1 hour.
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    queryFn: async () => {
      const res = await getAlgoliaApiKey().then(unwrapResult)
      return res
    },
    select(data) {
      return algoliasearch(data.app_id, data.api_key)
    },
  })
}
