import { useState } from "react"
import {
  Configure,
  InstantSearch,
  useRefinementList,
  useToggleRefinement,
} from "react-instantsearch"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { SearchInput } from "@/components/Forms"
import { Matches, RecipeList, Search } from "@/components/RecipeSearchList"
import { useSearchClient } from "@/queries/useSearchClient"
import { useTeamId } from "@/useTeamId"

function CustomRefinement({
  attribute,
  label,
}: {
  attribute: string
  label: string
}) {
  const { searchForItems, items, refine } = useRefinementList({
    attribute,
    limit: 5,
  })
  return (
    <div className="flex max-h-48 min-h-48 flex-col">
      <div className="font-medium">{label}</div>
      <SearchInput
        placeholder="search..."
        onChange={(e) => {
          searchForItems(e.target.value)
        }}
      />
      <div>
        {items.map((item) => {
          return (
            <div key={item.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={label + item.value}
                checked={item.isRefined}
                onChange={() => {
                  refine(item.value)
                }}
              />
              <label
                htmlFor={label + item.value}
                className="overflow-x-hidden text-ellipsis whitespace-nowrap"
              >
                {item.label}
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ArchivedToggle() {
  const { refine } = useToggleRefinement({
    attribute: "archived",
    on: [true, false],
    off: false,
  })
  return (
    <div>
      <div className="font-medium">Archived Recipes</div>
      <div className="flex items-center gap-2">
        <input
          id="archived_recipes"
          type="checkbox"
          onChange={(event) => {
            refine({ isRefined: !event.target.checked })
          }}
        />
        <label htmlFor="archived_recipes">Show archived</label>
      </div>
    </div>
  )
}

export function RecipeSearchList({
  noPadding,
  drag,
  scroll,
}: {
  readonly scroll?: boolean
  readonly drag?: boolean
  readonly noPadding?: boolean
}) {
  const [showAdvanced, setAdvanced] = useState(false)
  const teamId = useTeamId()

  const searchClient = useSearchClient()

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
      <div className={clx(noPadding ? "" : "ml-auto mr-auto max-w-[1000px]")}>
        <Search noPadding={noPadding} />
        <Configure hitsPerPage={1000} filters={`team_id:${teamId}`} />
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <div className="flex flex-col">
              {showAdvanced && (
                <div className="flex gap-2">
                  <CustomRefinement
                    label="Ingredients"
                    attribute="ingredients.name"
                  />
                  <CustomRefinement label="Tags" attribute="tags" />
                  <ArchivedToggle />
                </div>
              )}
              <Matches />
            </div>
            <div className="ml-auto">
              <Button
                size="small"
                onClick={() => {
                  setAdvanced((s) => !s)
                }}
              >
                {showAdvanced ? "hide search tools" : "search tools"}
              </Button>
            </div>
          </div>
          <RecipeList
            drag={drag}
            scroll={scroll}
            className="w-full"
            advancedSearch={showAdvanced}
          />
        </div>
      </div>
    </InstantSearch>
  )
}
