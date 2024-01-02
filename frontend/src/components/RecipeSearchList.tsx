import { useEffect, useState } from "react"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { RecipeListItem } from "@/pages/recipe-list/RecipeItem"
import { pathRecipeAdd } from "@/paths"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useSearchRecipes } from "@/queries/searchRecipes"
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

type Hits = NonNullable<ResponseFromUse<typeof useSearchRecipes>>["hits"]

export function RecipeList(props: {
  readonly className?: string
  readonly advancedSearch?: boolean
  readonly hits: Hits
  readonly isSuccess: boolean
  readonly query: string
}) {
  const [initialLimit, setLimit] = useState(20)

  const recipeItems = props.hits
    .map((hit, index) => {
      return <RecipeListItem key={index} index={index} hit={hit} {...hit} />
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

  if (!props.query && recipeItems.length === 0 && props.isSuccess) {
    return <AddRecipeCallToAction />
  }

  return (
    <div className={props.className}>
      <RecipeGrid>
        <Results recipes={recipeItems} query={props.query ?? ""} />
      </RecipeGrid>
    </div>
  )
}

export function Matches({
  nbHits,
  archivedCount,
  showArchived,
}: {
  nbHits: number
  archivedCount: number
  showArchived: boolean
}) {
  return (
    <div className="text-sm">
      matches: {nbHits} {showArchived && <>(archived: {archivedCount})</>}
    </div>
  )
}
