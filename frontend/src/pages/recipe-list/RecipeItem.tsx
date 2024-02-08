import {
  HitAttributeHighlightResult,
  HitHighlightResult,
} from "instantsearch.js"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { CustomHighlight } from "@/components/CustomHighlight"
import { Image } from "@/components/Image"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useSearchRecipes } from "@/queries/searchRecipes"
import { recipeURL } from "@/urls"

function HighlightIngredients({ hit }: { hit: Hit }) {
  const ingredientHighlights =
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (hit._highlightResult?.ingredients ?? []) as HitHighlightResult[]
  if ((ingredientHighlights.length ?? 0) === 0) {
    return null
  }
  return (
    <div className="flex flex-col gap-1">
      {ingredientHighlights.map((x, index) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const name = x?.name as HitAttributeHighlightResult | null
        if (!name || name.matchLevel === "none") {
          return null
        }

        return (
          <CustomHighlight
            key={index}
            attribute={`ingredients.${index}.name`}
            hit={hit}
          />
        )
      })}
    </div>
  )
}

type Hit = NonNullable<ResponseFromUse<typeof useSearchRecipes>>["hits"][number]

export function RecipeListItem({
  index,
  hit,
}: {
  readonly index: number
  readonly url?: string
  readonly hit: Hit
}) {
  const url = recipeURL(hit.id, hit.name)

  return (
    <Link tabIndex={0} to={url} className="flex flex-col">
      <div className="max-h-[128px] min-h-[128px] sm:max-h-[180px] sm:min-h-[180px]">
        <Image
          // lazy load everything after the first 20ish
          lazyLoad={index > 20}
          size="large"
          sources={
            hit.primary_image && {
              url: hit.primary_image.url,
              backgroundUrl: hit.primary_image.background_url,
            }
          }
          // TODO: add back background image with backdrop-filter: blur /
          // filter: blur when it isn't super slow in safari or when we add
          // windowing / virtualized lists or maybe an intersection observer?
          // rel: https://discourse.webflow.com/t/my-site-is-extremely-slow-in-safari-practically-unusable/167272/9
          // rel: https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
          // rel: https://stackoverflow.com/questions/31713468/css-blur-filter-performance
          blur="none"
          grayscale={hit.archived_at != null}
        />
      </div>
      <div className="flex h-full flex-col gap-1 pb-2 pt-1 leading-5">
        <div
          className={clx(
            hit.archived_at != null && "line-through",
            "line-clamp-2 text-ellipsis",
          )}
        >
          <CustomHighlight attribute="name" hit={hit} />
        </div>
        {hit.author && (
          <div className="block text-sm">
            <CustomHighlight attribute="author" hit={hit} />
          </div>
        )}
        <HighlightIngredients hit={hit} />
      </div>
    </Link>
  )
}
