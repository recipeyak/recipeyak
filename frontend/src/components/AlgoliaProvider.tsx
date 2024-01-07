import { SearchClient } from "algoliasearch"
import { createContext } from "react"

import { useAlgoliaClient } from "@/queries/useAlgoliaClient"
import { useTeamId } from "@/useTeamId"

export const AlgoliaContext = createContext<SearchClient | null>(null)

// https://github.com/algolia/algoliasearch-client-javascript/blob/5a2a128861b0e037bfb69e47a3ba0b88e9798386/packages/client-search/src/methods/client/getSecuredApiKeyRemainingValidity.ts#L3
function validUntilSeconds(key: string): number | null {
  const match = atob(key).match(/validUntil=(\d+)/)
  if (!match) {
    return null
  }
  return parseInt(match[1], 10) - Math.round(new Date().getTime() / 1000)
}

export function AlgoliaProvider({ children }: { children: React.ReactNode }) {
  const teamId = useTeamId()
  const res = useAlgoliaClient(teamId)

  return (
    <AlgoliaContext.Provider value={res.data ?? null}>
      {children}
    </AlgoliaContext.Provider>
  )
}
