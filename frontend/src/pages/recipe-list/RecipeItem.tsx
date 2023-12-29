import { Hit } from "instantsearch.js"
import { ForwardedRef, forwardRef } from "react"
import { useDrag } from "react-dnd"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { CustomHighlight } from "@/components/CustomHighlight"
import { DragIcon } from "@/components/icons"
import { Image } from "@/components/Image"
import { DragDrop } from "@/dragDrop"
import { RecipeListItem as TRecipeListItem } from "@/queries/recipeList"
import { imgixFmt } from "@/url"
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
      "flex flex-col rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-card)]",
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

type IRecipeItemProps = {
  readonly name: string
  readonly author: string | null
  readonly id: number
  readonly url?: string
  readonly hit: Hit
} & TRecipeListItem

export function RecipeListItem({
  index,
  name,
  author,
  id,
  hit,

  ...props
}: {
  readonly index: number
  readonly url?: string
  readonly hit: Hit
} & TRecipeListItem) {
  const url = props.url || recipeURL(id, name)

  return (
    <Card as={"Link"} tabIndex={0} to={url}>
      <div className="max-h-[128px] min-h-[128px] sm:max-h-[180px] sm:min-h-[180px]">
        <Image
          // lazy load everything after the first 20ish
          lazyLoad={index > 20}
          sources={
            props.primaryImage && {
              url: imgixFmt(props.primaryImage.url ?? ""),
              backgroundUrl: props.primaryImage.backgroundUrl ?? "",
            }
          }
          // TODO: add back background image with backdrop-filter: blur /
          // filter: blur when it isn't super slow in safari or when we add
          // windowing / virtualized lists or maybe an intersection observer?
          // rel: https://discourse.webflow.com/t/my-site-is-extremely-slow-in-safari-practically-unusable/167272/9
          // rel: https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
          // rel: https://stackoverflow.com/questions/31713468/css-blur-filter-performance
          blur="none"
          rounded={false}
        />
      </div>
      <div className="h-full p-2 leading-5">
        <div tabIndex={0} className="mb-1">
          {hit ? <CustomHighlight attribute="name" hit={hit} /> : name}
        </div>
        {author !== "" && hit && (
          <small className={clx("block")}>
            <CustomHighlight attribute="author" hit={hit} />
          </small>
        )}
      </div>
    </Card>
  )
}
export function RecipeItemDraggable({
  name,
  author,
  id,
  hit,
  ...props
}: IRecipeItemProps) {
  const url = props.url || recipeURL(id, name)

  const item: IRecipeItemDrag = {
    type: DragDrop.RECIPE,
    recipeID: id,
    recipeName: name,
  }

  const [{ isDragging }, drag] = useDrag({
    type: DragDrop.RECIPE,
    item,
    canDrag: true,
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  })

  return (
    <Card ref={drag} isDragging={isDragging}>
      <div className="flex h-full flex-col p-2">
        <div className="flex grow justify-between">
          <Link
            tabIndex={0}
            to={url}
            className="mb-1 grow self-start leading-5"
          >
            {hit ? <CustomHighlight hit={hit} attribute="name" /> : name}
          </Link>
          <DragIcon />
        </div>
        {author &&
          (hit ? <CustomHighlight hit={hit} attribute="author" /> : author)}
      </div>
    </Card>
  )
}

export interface IRecipeItemDrag {
  readonly recipeID: number
  readonly recipeName: string
  readonly type: DragDrop.RECIPE
}

export default RecipeItemDraggable
