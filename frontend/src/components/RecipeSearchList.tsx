import { Button } from "@/components/Buttons"
import { RecipeListItem } from "@/pages/recipe-list/RecipeItem"
import { pathRecipeAdd } from "@/paths"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"
import { useSearchRecipes } from "@/queries/useSearchRecipes"

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
    <div className="mx-auto mt-2 flex flex-col items-center gap-1">
      <div>No recipes here.</div>
      <Button variant="primary" size="small" to={pathRecipeAdd({})}>
        Add a Recipe
      </Button>
    </div>
  )
}

function NoMatchingRecipe({ query }: { readonly query: string }) {
  return (
    <div className="col-span-full justify-self-center [word-break:break-word]">
      No recipes found matching <strong>{query}</strong>
    </div>
  )
}

type Hits = NonNullable<ResponseFromUse<typeof useSearchRecipes>>["hits"]

export function RecipeList(props: {
  readonly className?: string
  readonly advancedSearch?: boolean
  readonly hits: Hits
  readonly isSuccess: boolean
  readonly query: string
}) {
  const recipeItems = props.hits.map((hit, index) => {
    return <RecipeListItem key={hit.id} index={index} hit={hit} />
  })

  if (!props.query && recipeItems.length === 0 && props.isSuccess) {
    return <AddRecipeCallToAction />
  }

  return (
    <div className={props.className}>
      <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(175px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(225px,1fr))]">
        <Results recipes={recipeItems} query={props.query ?? ""} />
      </div>
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
    <div className="flex flex-wrap gap-x-2 text-sm">
      <span>matches: {nbHits}</span>{" "}
      <span>{showArchived && <>(archived: {archivedCount})</>}</span>
    </div>
  )
}
