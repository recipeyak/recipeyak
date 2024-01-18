import { SearchClient } from "algoliasearch"
import { createContext, useContext } from "react"

export const AlgoliaContext = createContext<Pick<
  SearchClient,
  "search" | "searchForFacetValues"
> | null>(null)

export function useAlgoliaContext() {
  const searchClient = useContext(AlgoliaContext)
  if (searchClient == null) {
    throw Error("Expected context to exist")
  }
  return searchClient
}
