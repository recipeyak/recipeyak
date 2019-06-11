import React from "react"
import { Link } from "react-router-dom"
import { DragSource, ConnectDragSource } from "react-dnd"
import DatePickerForm from "@/components/DatePickerForm"
import { classNames } from "@/classnames"
import { recipeURL } from "@/urls"
import { DragDrop } from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
import Dropdown from "@/components/Dropdown"
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

interface IScheduleProps {
  readonly show: boolean
  readonly id: IRecipe["id"]
  readonly onClose: () => void
  readonly trigger: React.ReactElement<{}>
}

export function Schedule({ id, show, onClose, trigger }: IScheduleProps) {
  return (
    <Dropdown onClose={onClose} show={show} trigger={trigger}>
      <DatePickerForm recipeID={id} show={show} close={onClose} />
    </Dropdown>
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

export function RecipeItem({
  name,
  author,
  id,
  onSelect,
  ...props
}: IRecipeItemProps) {
  const url = props.url || recipeURL(id, name)

  const item: IRecipeItemDrag = { type: DragDrop.RECIPE, recipeID: id }

  const [{ isDragging }, drag] = useDrag({
    item,
    options: { dropEffect: "copy" },
    canDrag(): boolean {
      return !!props.drag
    },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      }
    }
  })

  return (
    <a
      ref={props.drag ? drag : undefined}
      onClick={() => onSelect(id)}
      className={classNames("card", {
        "cursor-move": props.drag
      })}
      style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="card-content h-100 d-flex flex-column">
        <RecipeTitle name={name} url={url} dragable={!!props.drag} />
        <Meta author={author} />
      </div>
    </a>
  )
}

export interface IRecipeItemDrag {
  readonly recipeID: IRecipeItemProps["id"]
  readonly type: DragDrop.RECIPE
}

export default RecipeItem
