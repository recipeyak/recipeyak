import { AlgoliaContext } from "@/components/algoliaContext"
import { useAlgoliaClient } from "@/queries/useAlgoliaClient"
import { useTeamId } from "@/useTeamId"

export function AlgoliaProvider({ children }: { children: React.ReactNode }) {
  const teamId = useTeamId()
  const client = useAlgoliaClient(teamId)

  return (
    <AlgoliaContext.Provider value={client}>{children}</AlgoliaContext.Provider>
  )
}
