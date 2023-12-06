import { ForwardedRef, forwardRef } from "react"
import { useDrag } from "react-dnd"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { DragIcon } from "@/components/icons"
import { Image } from "@/components/Image"
import { Tag } from "@/components/Tag"
import { DragDrop } from "@/dragDrop"
import { RecipeListItem as TRecipeListItem } from "@/queries/recipeList"
import { Match } from "@/search"
import { styled } from "@/theme"
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
      "flex flex-col border border-solid border-[var(--color-background-calendar-day)] bg-[var(--color-background-card)]",
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

interface IRecipeTitleProps {
  readonly url: string
  readonly name: string
  readonly dragable: boolean
}

function RecipeTitle({ url, name, dragable }: IRecipeTitleProps) {
  return (
    <div className="flex grow justify-between">
      <Link tabIndex={0} to={url} className="mb-1 grow self-start leading-5">
        {name}
      </Link>
      {dragable && <DragIcon />}
    </div>
  )
}

function Ingredient({ children }: { children: React.ReactNode }) {
  return (
    <small className="overflow-x-hidden text-ellipsis whitespace-nowrap font-bold">
      {children}
    </small>
  )
}

const CardImgContainer = styled.div`
  @media (max-width: 449px) {
    min-height: 128px;
    max-height: 128px;
  }
  @media (min-width: 450px) {
    min-height: 180px;
    max-height: 180px;
  }
`

type IRecipeItemProps = {
  readonly name: string
  readonly author: string | null
  readonly id: number
  readonly url?: string
  readonly drag?: boolean
  readonly match: Match[]
  readonly index: number
} & TRecipeListItem

function RecipeListItem({
  index,
  name,
  author,
  id,
  match: matches,
  ...props
}: {
  readonly index: number
  readonly url?: string
  readonly match: Match[]
} & TRecipeListItem) {
  const url = props.url || recipeURL(id, name)

  const ingredientMatch = matches.find((x) => x.kind === "ingredient")
  const tagMatch = matches.find((x) => x.kind === "tag")
  const authorMatch = matches.find((x) => x.kind === "author")

  const recipeContent = (
    <div className="h-full p-2 leading-5">
      <div tabIndex={0} className="mb-1">
        {name}
      </div>

      {ingredientMatch != null ? (
        <small className="overflow-x-hidden text-ellipsis whitespace-nowrap font-bold">
          {ingredientMatch.value}
        </small>
      ) : null}
      {author !== "" && (
        <small className={clx("block", { "font-bold": authorMatch != null })}>
          {author}
        </small>
      )}

      <div>{tagMatch != null ? <Tag>{tagMatch.value}</Tag> : null}</div>
    </div>
  )

  return (
    <Card as={"Link"} tabIndex={0} to={url}>
      <CardImgContainer>
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
      </CardImgContainer>
      {recipeContent}
    </Card>
  )
}
interface IMetaProps {
  readonly author: string
  readonly bold: boolean
}

function Meta({ author, bold }: IMetaProps) {
  return (
    <div
      className={clx("flex", "items-center", {
        "font-bold": bold,
      })}
    >
      {author !== "" ? <small>{author}</small> : null}
    </div>
  )
}

export function RecipeItem({
  name,
  author,
  id,
  index,
  match: matches,
  ...props
}: IRecipeItemProps) {
  if (!props.drag) {
    return (
      <RecipeListItem
        index={index}
        name={name}
        author={author}
        id={id}
        match={matches}
        {...props}
      />
    )
  }

  const url = props.url || recipeURL(id, name)

  const item: IRecipeItemDrag = {
    type: DragDrop.RECIPE,
    recipeID: id,
    recipeName: name,
  }

  // We don't actually run this conditionally in production.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [{ isDragging }, drag] = useDrag({
    type: DragDrop.RECIPE,
    item,
    canDrag: () => {
      return !!props.drag
    },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  })

  const ingredientMatch = matches.find((x) => x.kind === "ingredient")
  const tagMatch = matches.find((x) => x.kind === "tag")
  const authorMatch = matches.find((x) => x.kind === "author")

  const recipeContent = (
    <div className="flex h-full flex-col p-2">
      <RecipeTitle name={name} url={url} dragable={!!props.drag} />
      {ingredientMatch != null ? (
        <Ingredient>{ingredientMatch.value}</Ingredient>
      ) : null}
      <div>{tagMatch != null ? <Tag>{tagMatch.value}</Tag> : null}</div>
      <Meta bold={authorMatch != null} author={author ?? ""} />
    </div>
  )

  return (
    <Card ref={drag} isDragging={isDragging}>
      {recipeContent}
    </Card>
  )
}

export interface IRecipeItemDrag {
  readonly recipeID: number
  readonly recipeName: string
  readonly type: DragDrop.RECIPE
}

export default RecipeItem
