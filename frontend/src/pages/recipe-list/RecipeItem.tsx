import { useDrag } from "react-dnd"
import { Link } from "react-router-dom"

import { classNames } from "@/classnames"
import { DragIcon } from "@/components/icons"
import { DragDrop } from "@/dragDrop"
import { Match } from "@/search"
import { IRecipe } from "@/store/reducers/recipes"
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

const CardImg = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover;
  position: absolute;
  z-index: 1;
`

// TODO: add back background image with backdrop-filter: blur /
// filter: blur when it isn't super slow in safari or when we add
// windowing / virtualized lists or maybe an intersection observer?
// rel: https://discourse.webflow.com/t/my-site-is-extremely-slow-in-safari-practically-unusable/167272/9
// rel: https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
// rel: https://stackoverflow.com/questions/31713468/css-blur-filter-performance
const CardImgBg = styled.div<{ backgroundImage: string }>`
  height: 100%;
  width: 100%;
  position: relative;
  background-image: url(${(props) => props.backgroundImage});
  background-position: center;
  background-size: cover;
`
const CardImgContainer = styled.div`
  min-height: 160px;
  max-height: 160px;
  background-color: rgb(237, 237, 237);
  position: relative;
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
      <Link tabIndex={0} to={url} className="mb-1">
        {name}
      </Link>

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
        {props.primaryImage != null && (
          <>
            <CardImg src={imgixFmt(props.primaryImage?.url ?? "")} />
            <CardImgBg
              backgroundImage={props.primaryImage.backgroundUrl ?? ""}
            />
          </>
        )}
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

  const item: IRecipeItemDrag = { type: DragDrop.RECIPE, recipeID: id }

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
  readonly recipeID: IRecipeItemProps["id"]
  readonly type: DragDrop.RECIPE
}

export default RecipeItem
