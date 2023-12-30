import { useState } from "react"
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  useRefinementList,
  useSearchBox,
  useToggleRefinement,
} from "react-instantsearch"

import { clx } from "@/classnames"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { SearchInput } from "@/components/Forms"
import RecipeItemDraggable, {
  RecipeListItem,
} from "@/pages/recipe-list/RecipeItem"
import { pathRecipeAdd } from "@/paths"
import { useSearchClient } from "@/queries/useSearchClient"
import { RecipeYakHit } from "@/search-types"
import { styled } from "@/theme"
import { useTeamId } from "@/useTeamId"

interface IResultsProps {
  readonly recipes: JSX.Element[]
  readonly query: string
}

function Results({ recipes, query }: IResultsProps) {
  if (recipes.length === 0 && query !== "") {
    return <NoMatchingRecipe query={query} />
  }
  return <>{recipes}</>
}

function AddRecipeCallToAction() {
  return (
    <Box dir="col" mx="auto" mt={2} align="center" gap={1}>
      <div>No recipes here.</div>
      <Button variant="primary" size="small" to={pathRecipeAdd({})}>
        Add a Recipe
      </Button>
    </Box>
  )
}

function NoMatchingRecipe({ query }: { readonly query: string }) {
  return (
    <div className="col-span-full justify-self-center [word-break:break-word]">
      No recipes found matching <strong>{query}</strong>
    </div>
  )
}

const RecipeScroll = styled.div<{ scroll: boolean | undefined }>`
  // we only enable scrolling when not at the small width (aka mobile), since
  // scroll boxes on mobile are much worse than normal scroll behavior
  ${(p) =>
    p.scroll &&
    `@media (min-width: ${p.theme.small}) {
       height: calc(100vh - 9rem);
       overflow: auto;
       // edges of the recipe boxes get cut without extra padding
       padding: 0.125rem; 
     }`}
`

const RecipeGrid = styled.div`
  display: grid;
  gap: 0.5rem;
  // support two columns on iOS.

  @media (max-width: 449px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  @media (min-width: 450px) {
    grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
  }
`

function RecipeList(props: {
  readonly drag?: boolean
  readonly className?: string
  readonly scroll?: boolean
  readonly advancedSearch?: boolean
}) {
  const { hits } = useHits<RecipeYakHit>()
  const {
    indexUiState: { query },
    status,
    results,
  } = useInstantSearch()

  const recipeItems = hits.map((hit, index) => {
    if (!props.drag) {
      return <RecipeListItem key={index} index={hit.id} hit={hit} {...hit} />
    }
    return <RecipeItemDraggable hit={hit} key={hit.id} />
  })

  // @ts-expect-error ts(2339): Property 'serverTimeMS' does not exist on type 'SearchResults<any>'.
  const hasServerResults = results.serverTimeMS != null
  if (
    !query &&
    recipeItems.length === 0 &&
    hasServerResults &&
    status === "idle"
  ) {
    return <AddRecipeCallToAction />
  }

  return (
    <RecipeScroll scroll={props.scroll} className={props.className}>
      <RecipeGrid>
        <Results recipes={recipeItems} query={query ?? ""} />
      </RecipeGrid>
    </RecipeScroll>
  )
}

function Search({ noPadding }: { noPadding: boolean | undefined }) {
  const { query, refine } = useSearchBox()
  return (
    <SearchInput
      value={query}
      className={clx(noPadding ? "" : "mb-2")}
      onChange={(e) => {
        refine(e.target.value)
      }}
      placeholder="search"
    />
  )
}

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

function Matches() {
  const { results: algoliaResults } = useHits()
  const {
    value: {
      onFacetValue: { count: countOn },
    },
  } = useToggleRefinement({
    attribute: "archived",
    on: [true, false],
    off: false,
  })

  return (
    <div className="text-sm">
      matches: {algoliaResults?.nbHits || 0} (archived:{" "}
      {(countOn ?? 0) - (algoliaResults?.nbHits ?? 0)})
    </div>
  )
}

// TODO(sbdchd): this really shouldn't be shared like it is
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
