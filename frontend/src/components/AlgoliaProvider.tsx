import algoliasearch, { SearchClient } from "algoliasearch"
import { createContext, useMemo } from "react"

import { useAlgoliaApiKey } from "@/queries/useAlgoliaApiKey"
import { useTeamId } from "@/useTeamId"

export const AlgoliaContext = createContext<SearchClient | null>(null)

export function AlgoliaProvider({ children }: { children: React.ReactNode }) {
  const teamId = useTeamId()
  const res = useAlgoliaApiKey()

  const searchClient = useMemo(() => {
    if (res.data?.app_id == null || teamId === -1) {
      return null
    }
    return algoliasearch(res.data.app_id, res.data.api_key)
  }, [res.data?.api_key, res.data?.app_id, teamId])
  return (
    <AlgoliaContext.Provider value={searchClient}>
      {children}
    </AlgoliaContext.Provider>
  )
}
