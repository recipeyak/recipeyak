import { Configure, InstantSearch } from "react-instantsearch"

import { Matches, RecipeList, Search } from "@/components/RecipeSearchList"
import { useSearchClient } from "@/queries/useSearchClient"
import { useTeamId } from "@/useTeamId"

export function RecipeSearchListSchedule() {
  const searchClient = useSearchClient()
  const teamId = useTeamId()

  if (!searchClient) {
    return null
  }

  return (
    <InstantSearch searchClient={searchClient} indexName="recipes">
      <Search noPadding={true} />
      <Configure hitsPerPage={1000} filters={`team_id:${teamId}`} />
      <Matches />
      <RecipeList drag={true} scroll={true} className="w-full" />
    </InstantSearch>
  )
}
