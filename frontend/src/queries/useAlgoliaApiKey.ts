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
    // refetch daily. Tokens expire after 10 days.
    // The browser cache should have this information.
    refetchInterval: 24 * 60 * 60 * 1000,
    queryFn: async () => {
      const res = await getAlgoliaApiKey().then(unwrapResult)
      return res
    },
  })
}
