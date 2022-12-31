import { useDrag } from "react-dnd"
import { Link } from "react-router-dom"

import { IRecipe } from "@/api"
import { classNames } from "@/classnames"
import { DragIcon } from "@/components/icons"
import { Image } from "@/components/Image"
import { DragDrop } from "@/dragDrop"
import { Match } from "@/search"
import { styled } from "@/theme"
import { recipeURL } from "@/urls"
import { imgixFmt } from "@/utils/url"

interface IRecipeTitleProps {
  readonly url: string
  readonly name: string
  readonly dragable: boolean
}

function RecipeTitle({ url, name, dragable }: IRecipeTitleProps) {
  return (
    <div className="flex-grow d-flex justify-between">
      <Link tabIndex={0} to={url} className="align-self-start mb-1">
        {name}
      </Link>
      {dragable && <DragIcon />}
    </div>
  )
}

const Ingredient = styled.small`
  font-weight: bold;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

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
} & IRecipe

function RecipeListItem({
  name,
  author,
  id,
  match: matches,
  ...props
}: {
  readonly url?: string
  readonly match: Match[]
} & IRecipe) {
  const url = props.url || recipeURL(id, name)

  const ingredientMatch = matches.find((x) => x.kind === "ingredient")
  const tagMatch = matches.find((x) => x.kind === "tag")
  const authorMatch = matches.find((x) => x.kind === "author")

  const recipeContent = (
    <div className="h-100 p-2 pt-0">
      <div tabIndex={0} className="mb-1">
        {name}
      </div>

      {ingredientMatch != null ? (
        <Ingredient>{ingredientMatch.value}</Ingredient>
      ) : null}
      {author !== "" && (
        <small
          className={classNames("d-block", { "fw-bold": authorMatch != null })}
        >
          {author}
        </small>
      )}

      <div>
        {tagMatch != null ? (
          <span className="tag">{tagMatch.value}</span>
        ) : null}
      </div>
    </div>
  )

  return (
    <Link tabIndex={0} to={url} className="card">
      <CardImgContainer>
        <Image
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
    </Link>
  )
}
interface IMetaProps {
  readonly author: string
  readonly bold: boolean
}

function Meta({ author, bold }: IMetaProps) {
  return (
    <div
      className={classNames("content", "d-flex", "align-items-center", {
        "fw-bold": bold,
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
  match: matches,
  ...props
}: IRecipeItemProps) {
  if (!props.drag) {
    return (
      <RecipeListItem
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
    <div className="card-content h-100 d-flex flex-column">
      <RecipeTitle name={name} url={url} dragable={!!props.drag} />
      {ingredientMatch != null ? (
        <Ingredient>{ingredientMatch.value}</Ingredient>
      ) : null}
      <div>
        {tagMatch != null ? (
          <span className="tag">{tagMatch.value}</span>
        ) : null}
      </div>
      <Meta bold={authorMatch != null} author={author ?? ""} />
    </div>
  )

  return (
    <section
      ref={drag}
      className="card cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {recipeContent}
    </section>
  )
}

export interface IRecipeItemDrag {
  readonly recipeID: number
  readonly recipeName: string
  readonly type: DragDrop.RECIPE
}

export default RecipeItem
