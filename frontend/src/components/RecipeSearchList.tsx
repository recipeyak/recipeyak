import { useEffect, useState } from "react"
import {
  useHits,
  useInstantSearch,
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
import { RecipeYakHit } from "@/search-types"
import { styled } from "@/theme"

function Results({
  recipes,
  query,
}: {
  readonly recipes: JSX.Element[]
  readonly query: string
}) {
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

export function RecipeList(props: {
  readonly drag?: boolean
  readonly className?: string
  readonly scroll?: boolean
  readonly advancedSearch?: boolean
}) {
  const { hits } = useHits<RecipeYakHit>()
  const [initialLimit, setLimit] = useState(20)
  const {
    indexUiState: { query },
    status,
    results,
  } = useInstantSearch()

  const recipeItems = hits
    .map((hit, index) => {
      if (!props.drag) {
        return <RecipeListItem key={index} index={hit.id} hit={hit} {...hit} />
      }
      return <RecipeItemDraggable hit={hit} key={hit.id} />
    })
    .slice(0, initialLimit)

  // HACK(cdignam): We initially render only 20 items, then we render the remaining items.
  //
  // Ideally we'd use windowing to fix this.
  useEffect(() => {
    if (recipeItems.length === 20) {
      setTimeout(() => {
        setLimit(Infinity)
      }, 1)
    }
  }, [recipeItems.length])

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

export function Search({ noPadding }: { noPadding: boolean | undefined }) {
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

export function Matches() {
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
