import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

const getAlgoliaApiKey = () =>
  http.get<{
    readonly app_id: string
    readonly api_key: string
  }>("/api/v1/auth/algolia/")

export function useAlgoliaApiKey() {
  return useQuery({
    queryKey: ["algolia"],
    // only fetch on page load.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const res = await getAlgoliaApiKey().then(unwrapResult)
      return res
    },
  })
}
