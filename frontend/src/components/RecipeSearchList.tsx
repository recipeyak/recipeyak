import { orderBy, sortBy } from "lodash-es"
import {
  InstantSearch,
  useHits,
  useInstantSearch,
  useSearchBox,
  useToggleRefinement,
} from "react-instantsearch"

import { clx } from "@/classnames"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { CheckBox, SearchInput } from "@/components/Forms"
import { Loader } from "@/components/Loader"
import RecipeItem from "@/pages/recipe-list/RecipeItem"
import { pathRecipeAdd } from "@/paths"
import { RecipeListItem, useRecipeList } from "@/queries/recipeList"
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

function RecipeList(props: {
  readonly drag?: boolean
  readonly scroll?: boolean
}) {
  const { hits, results: algoliaResults } = useHits<{
    name: string
    archived_at: string
  }>()
  const {
    indexUiState: { query },
  } = useInstantSearch()
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

  const recipes = useRecipeList()

  if (!recipes.isSuccess) {
    return <Loader />
  }
  const recipeMap = recipes.data.reduce<Record<string, RecipeListItem>>(
    (map, recipe) => {
      map[recipe.id] = recipe
      return map
    },
    {},
  )

  const results = query
    ? hits.map((hit) => {
        return { recipe: recipeMap[hit.objectID], match: [] }
      })
    : // if not query, show everything.
      orderBy(
        recipes.data.map((recipe) => ({ recipe, match: [] })),
        [
          (x) => x.recipe.archived_at != null,
          (x) => x.recipe.name.toUpperCase(),
        ],
      )

  const recipeItems = results.map((result, index) => (
    <RecipeItem
      {...result.recipe}
      index={index}
      match={result.match}
      drag={props.drag}
      key={result.recipe.id}
    />
  ))

  if (recipes.data.length === 0) {
    return <AddRecipeCallToAction />
  }

  const archivedCount = (countOn ?? 0) - (countOff ?? 0)

  return (
    <RecipeScroll scroll={props.scroll}>
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
      <RecipeGrid>
        <Results recipes={recipeItems} query={"props.query"} />
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
  const searchClient = useSearchClient()

  if (!searchClient) {
    return null
  }

  return (
    <InstantSearch searchClient={searchClient} indexName="recipes">
      <div className={clx(noPadding ? "" : "ml-auto mr-auto max-w-[1000px]")}>
        <Search noPadding={noPadding} />
        <RecipeList drag={drag} scroll={scroll} />
      </div>
    </InstantSearch>
  )
}
