import { RouteComponentProps } from "react-router"

import { INote, TimelineItem } from "@/api"
import { Helmet } from "@/components/Helmet"
import { Loader } from "@/components/Loader"
import { Meta } from "@/components/Meta"
import { CookingFullscreen } from "@/pages/cook-detail/CookingFullscreen"
import { pathCookDetail } from "@/paths"
import { useRecipeFetch } from "@/queries/recipeFetch"
import { formatImgOpenGraph } from "@/utils/url"
import { useAddSlugToUrl } from "@/utils/useAddSlugToUrl"

function isNote(x: TimelineItem): x is INote {
  return x.type === "note"
}

export default function CookDetail(
  props: RouteComponentProps<{ recipeId: string }>,
) {
  const recipeId = parseInt(props.match.params.recipeId, 10)
  const maybeRecipe = useRecipeFetch({ recipeId })
  const myRecipe = maybeRecipe.isSuccess ? maybeRecipe.data : null
  const notes = myRecipe?.timelineItems.filter(isNote) ?? []

  useAddSlugToUrl(
    pathCookDetail({ recipeId: recipeId.toString() }),
    maybeRecipe.data?.name,
  )

  if (maybeRecipe.isLoading) {
    return <Loader />
  }

  if (maybeRecipe.isError) {
    return <p>recipe not found</p>
  }

  const recipe = maybeRecipe.data

  let recipeTitle = recipe.name
  if (recipe.author) {
    recipeTitle = recipeTitle + ` by ${recipe.author}`
  }

  return (
    <div>
      <Helmet title={recipe.name} />
      <Meta
        title={recipeTitle}
        image={formatImgOpenGraph(recipe.primaryImage?.url ?? "")}
      />
      <CookingFullscreen
        recipeId={recipe.id}
        recipeName={recipe.name}
        recipeSource={recipe.source}
        ingredients={recipe.ingredients}
        steps={recipe.steps}
        notes={notes}
      />
    </div>
  )
}
