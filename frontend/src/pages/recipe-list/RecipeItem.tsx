import { useDrag } from "react-dnd"
import { Link } from "react-router-dom"

import { classNames } from "@/classnames"
import { DragIcon } from "@/components/icons"
import { DragDrop } from "@/dragDrop"
import { Match } from "@/search"
import { styled } from "@/theme"
import { recipeURL } from "@/urls"

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

const Ingredient = styled.small`
  font-weight: bold;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

interface IRecipeItemProps {
  readonly name: string
  readonly author: string
  readonly id: number
  readonly url?: string
  readonly drag?: boolean
  readonly match: Match[]
}

export function RecipeItem({
  name,
  author,
  id,
  match: matches,
  ...props
}: IRecipeItemProps) {
  const url = props.url || recipeURL(id, name)

  const item: IRecipeItemDrag = { type: DragDrop.RECIPE, recipeID: id }

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
      <Meta bold={authorMatch != null} author={author} />
    </div>
  )

  if (props.drag) {
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

  return (
    <Link tabIndex={0} to={url} className="card">
      {recipeContent}
    </Link>
  )
}

export interface IRecipeItemDrag {
  readonly recipeID: IRecipeItemProps["id"]
  readonly type: DragDrop.RECIPE
}

export default RecipeItem
