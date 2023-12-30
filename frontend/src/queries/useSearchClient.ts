import algoliasearch, { SearchClient } from "algoliasearch/lite"

import { useAlgoliaApiKey } from "@/queries/useAlgoliaApiKey"

const cache = new Map<string, SearchClient>()

/**
 * Keep a single stable client across function calls.
 */
export function useSearchClient(): SearchClient | null {
  const apiKey = useAlgoliaApiKey()
  if (apiKey.data?.api_key == null) {
    return null
  }

  const key = apiKey.data.api_key + apiKey.data.app_id
  const client = cache.get(key)
  if (client) {
    return client
  }
  const newClient = algoliasearch(apiKey.data.app_id, apiKey.data.api_key)
  cache.set(key, newClient)
  return newClient
}
