import { orderBy } from "lodash-es"
import { useState } from "react"
import {
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
import { CheckBox, SearchInput } from "@/components/Forms"
import { Loader } from "@/components/Loader"
import RecipeItemDraggable, {
  RecipeListItem,
} from "@/pages/recipe-list/RecipeItem"
import { pathRecipeAdd } from "@/paths"
import {
  RecipeListItem as RecipeListItemT,
  useRecipeList,
} from "@/queries/recipeList"
import { useSearchClient } from "@/queries/useSearchClient"
import { styled } from "@/theme"

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
    // eslint-disable-next-line react/forbid-elements
    <p className="col-span-full justify-self-center [word-break:break-word]">
      No recipes found matching <strong>{query}</strong>
    </p>
  )
}

const NAV_HEIGHT = "65px"
const SEARCH_AND_TAB_HEIGHT = "30px"

const RecipeScroll = styled.div<{ scroll: boolean | undefined }>`
  // we only enable scrolling when not at the small width (aka mobile), since
  // scroll boxes on mobile are much worse than normal scroll behavior
  ${(p) =>
    p.scroll &&
    `@media (min-width: ${p.theme.small}) {
       height: calc(100vh - (${NAV_HEIGHT} + ${SEARCH_AND_TAB_HEIGHT}));
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

export function ResultInfo() {
  const { results: algoliaResults } = useHits<{
    name: string
    archived_at: string
  }>()
  const {
    refine,
    value: {
      offFacetValue: { count: countOff },
      onFacetValue: { count: countOn },
    },
  } = useToggleRefinement({
    attribute: "archived",
    on: [true, false],
    off: false,
  })
  const archivedCount = (countOn ?? 0) - (countOff ?? 0)
  return (
    <div className="mb-2 flex flex-wrap justify-between">
      <div className="mr-2 text-[14px]">
        matches: {algoliaResults?.nbHits || 0}
      </div>
      <div className="text-[14px]">
        <label>
          include archived ({archivedCount}):
          <CheckBox
            onChange={(event) => {
              refine({ isRefined: !event.target.checked })
            }}
            name="optional"
            className="ml-1 mr-2"
          />
        </label>
      </div>
    </div>
  )
}

function RecipeList(props: {
  readonly drag?: boolean
  readonly className?: string
  readonly scroll?: boolean
  readonly advancedSearch?: boolean
}) {
  const { hits } = useHits<{
    name: string
    archived_at: string
  }>()
  const {
    indexUiState: { query },
  } = useInstantSearch()

  const recipes = useRecipeList()

  if (!recipes.isSuccess) {
    return <Loader />
  }
  const recipeMap = recipes.data.reduce<Record<string, RecipeListItemT>>(
    (map, recipe) => {
      map[recipe.id] = recipe
      return map
    },
    {},
  )

  const results =
    query || props.advancedSearch
      ? hits.map((hit) => {
          return { recipe: recipeMap[hit.objectID], hit }
        })
      : // if not query, show everything.
        orderBy(
          recipes.data.map((recipe) => ({
            recipe,
            hit: {
              __position: 0,
              objectID: recipe.id.toString(),
              _highlightResult: {
                author: {
                  value: recipe.author ?? "",
                  matchedWords: [],
                  matchLevel: "none" as const,
                },
                name: {
                  value: recipe.name,
                  matchedWords: [],
                  matchLevel: "none" as const,
                },
              },
            },
          })),
          [
            (x) => x.recipe.archived_at != null,
            (x) => x.recipe.name.toUpperCase(),
          ],
        )

  const recipeItems = results.map((result, index) => {
    if (!props.drag) {
      return (
        <RecipeListItem
          key={index}
          index={result.recipe.id}
          hit={result.hit}
          {...result.recipe}
        />
      )
    }
    return (
      <RecipeItemDraggable
        {...result.recipe}
        hit={result.hit}
        key={result.recipe.id}
      />
    )
  })

  if (recipes.data.length === 0) {
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
    <div className="flex  max-h-48 min-h-48 flex-col">
      <div className="font-bold">{label}</div>
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
      <div className="font-bold">Archived Recipes</div>
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
    <div>
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

  const searchClient = useSearchClient()

  if (!searchClient) {
    return null
  }

  return (
    <InstantSearch searchClient={searchClient} indexName="recipes">
      <div className={clx(noPadding ? "" : "ml-auto mr-auto max-w-[1000px]")}>
        <Search noPadding={noPadding} />
        <div className="flex flex-col gap-2">
          <div className="flex  gap-2 ">
            <div className="flex flex-col">
              {showAdvanced && (
                <div className="flex gap-2">
                  <CustomRefinement
                    label="Ingredients"
                    attribute="ingredients.quantity_name"
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
                {showAdvanced ? "hide advanced search" : "show advanced search"}
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

  if (!searchClient) {
    return null
  }

  return (
    <InstantSearch searchClient={searchClient} indexName="recipes">
      <Search noPadding={true} />
      <Matches />
      <RecipeList drag={true} scroll={true} className="w-full" />
    </InstantSearch>
  )
}
