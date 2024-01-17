import { SearchClient } from "algoliasearch"
import { createContext } from "react"

import { useAlgoliaClient } from "@/queries/useAlgoliaClient"
import { useTeamId } from "@/useTeamId"

export const AlgoliaContext = createContext<SearchClient | null>(null)

export function AlgoliaProvider({ children }: { children: React.ReactNode }) {
  const teamId = useTeamId()
  const res = useAlgoliaClient(teamId)

  return (
    <AlgoliaContext.Provider
      value={
        // when our data is stale, our token will be invalid. Return null while
        // react-query fetches new data.
        (!res.isStale ? res.data : null) ?? null
      }
    >
      {children}
    </AlgoliaContext.Provider>
  )
}
