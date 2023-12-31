import { Configure, InstantSearch } from "react-instantsearch-core"

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
    <InstantSearch
      searchClient={searchClient}
      indexName="recipes"
      // use custom routing config so we can have `search` be our query parameter.
      // https://www.algolia.com/doc/guides/building-search-ui/going-further/routing-urls/react-hooks/
      routing={{
        stateMapping: {
          stateToRoute(uiState) {
            const indexUiState = uiState["recipes"]
            return { search: indexUiState.query }
          },
          routeToState(routeState) {
            return {
              ["recipes"]: {
                query: routeState.search,
              },
            }
          },
        },
      }}
    >
      <Search noPadding={true} />
      <Configure hitsPerPage={1000} filters={`team_id:${teamId}`} />
      <Matches />
      <RecipeList drag={true} scroll={true} className="w-full" />
    </InstantSearch>
  )
}
