import algoliasearch, { SearchClient } from "algoliasearch/lite"
import { useMemo } from "react"

import { useAlgoliaApiKey } from "@/queries/useAlgoliaApiKey"

export function useSearchClient(): SearchClient | null {
  const apiKey = useAlgoliaApiKey()

  return useMemo(() => {
    if (apiKey.data?.key == null) {
      return null
    }
    return algoliasearch("5R9T0OJITJ", apiKey.data.key)
  }, [apiKey.data?.key])
}
