import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

const getAlgoliaApiKey = () =>
  http.get<{
    readonly key: string
  }>("/api/v1/auth/algolia/")

export function useAlgoliaApiKey() {
  return useQuery({
    queryKey: ["algolia"],
    queryFn: async () => {
      const res = await getAlgoliaApiKey().then(unwrapResult)
      return res
    },
  })
}
