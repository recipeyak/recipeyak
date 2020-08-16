import React from "react"
import { Link } from "react-router-dom"
import { useDrag } from "react-dnd"
import { classNames } from "@/classnames"
import { recipeURL } from "@/urls"
import { DragDrop } from "@/dragDrop"
import { DragIcon } from "@/components/icons"

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
}

function Meta({ author }: IMetaProps) {
  return (
    <div className={classNames("content", "d-flex", "align-items-center")}>
      {author !== "" ? <small>{author}</small> : null}
    </div>
  )
}

interface IRecipeItemProps {
  readonly name: string
  readonly author: string
  readonly id: number
  readonly url?: string
  readonly drag?: boolean
}

export function RecipeItem({ name, author, id, ...props }: IRecipeItemProps) {
  const url = props.url || recipeURL(id, name)

  const item: IRecipeItemDrag = { type: DragDrop.RECIPE, recipeID: id }

  const [{ isDragging }, drag] = useDrag({
    item,
    options: { dropEffect: "copy" },
    canDrag: () => {
      return !!props.drag
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  })

  return (
    <section
      ref={props.drag ? drag : undefined}
      className={classNames("card", {
        "cursor-move": props.drag,
      })}
      style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="card-content h-100 d-flex flex-column">
        <RecipeTitle name={name} url={url} dragable={!!props.drag} />
        <Meta author={author} />
      </div>
    </section>
  )
}

export interface IRecipeItemDrag {
  readonly recipeID: IRecipeItemProps["id"]
  readonly type: DragDrop.RECIPE
}

export default RecipeItem
