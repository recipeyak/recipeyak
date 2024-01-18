import {
  HitAttributeHighlightResult,
  HitHighlightResult,
} from "instantsearch.js"
import { ForwardedRef, forwardRef } from "react"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { CustomHighlight } from "@/components/CustomHighlight"
import { Image } from "@/components/Image"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useSearchRecipes } from "@/queries/searchRecipes"
import { recipeURL } from "@/urls"

const Card = forwardRef(
  (
    {
      children,
      isDragging,
      tabIndex,
      ...rest
    }: { children: React.ReactNode; tabIndex?: number } & (
      | {
          as: "Link"
          to: string
          isDragging?: undefined
        }
      | {
          as?: undefined
          isDragging: boolean
        }
    ),
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const className = clx(
      "flex flex-col rounded-md border border-solid border-[--color-border] bg-[--color-background-card]",
      isDragging != null && "cursor-move",
      isDragging ? "opacity-50" : "opacity-100",
    )
    if (rest.as === "Link") {
      return (
        <Link
          className={className}
          to={rest.to}
          children={children}
          tabIndex={tabIndex}
        />
      )
    }
    return (
      <div ref={ref} className={className} tabIndex={tabIndex}>
        {children}
      </div>
    )
  },
)

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
    <Card as={"Link"} tabIndex={0} to={url}>
      <div className="max-h-[128px] min-h-[128px] sm:max-h-[180px] sm:min-h-[180px]">
        <Image
          // lazy load everything after the first 20ish
          lazyLoad={index > 20}
          imgixFmt="large"
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
          rounded={true}
        />
      </div>
      <div className="h-full p-2 leading-5">
        <div className={clx("mb-1", hit.archived_at != null && "line-through")}>
          <CustomHighlight attribute="name" hit={hit} />
        </div>
        {hit.author && (
          <small className={clx("block")}>
            <CustomHighlight attribute="author" hit={hit} />
          </small>
        )}
        <HighlightIngredients hit={hit} />
      </div>
    </Card>
  )
}
