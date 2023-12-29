import algoliasearch, { SearchClient } from "algoliasearch/lite"
import { useMemo } from "react"

import { useAlgoliaApiKey } from "@/queries/useAlgoliaApiKey"

export function useSearchClient(): SearchClient | null {
  const apiKey = useAlgoliaApiKey()

  return useMemo(() => {
    if (apiKey.data?.api_key == null) {
      return null
    }
    return algoliasearch(apiKey.data.app_id, apiKey.data.api_key)
  }, [apiKey.data?.api_key, apiKey.data?.app_id])
}
