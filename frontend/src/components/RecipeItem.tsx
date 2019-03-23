import React, { useState } from "react"
import { Link } from "react-router-dom"
import { DragSource, ConnectDragSource } from "react-dnd"
import DatePickerForm from "@/components/DatePickerForm"
import { ButtonPlain } from "@/components/Buttons"
import { classNames } from "@/classnames"
import { recipeURL } from "@/urls"
import { DragDrop } from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
import Dropdown from "@/components/Dropdown"

interface IRecipeTitleProps {
  readonly url: string
  readonly name: string
}

function RecipeTitle({ url, name }: IRecipeTitleProps) {
  return (
    <div className="flex-grow">
      <Link tabIndex={0} to={url} className="align-self-start mb-1">
        {name}
      </Link>
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
  readonly id: IRecipe["id"]
  readonly author: string
  readonly show: boolean
  readonly onClose: () => void
  readonly onToggle: () => void
}

function Meta({ id, author, show, onClose, onToggle }: IMetaProps) {
  return (
    <div
      className={classNames(
        "content",
        "d-flex",
        "align-items-center",
        author !== "" ? "justify-space-between" : "justify-content-end"
      )}>
      {author !== "" ? <small>{author}</small> : null}
      <Schedule
        id={id}
        show={show}
        onClose={onClose}
        trigger={
          <ButtonPlain size="small" onClick={onToggle}>
            schedule
          </ButtonPlain>
        }
      />
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

interface ICollectedProps {
  readonly connectDragSource?: ConnectDragSource
  readonly isDragging?: boolean
}

export function RecipeItem({
  name,
  author,
  id,
  connectDragSource,
  isDragging,
  ...props
}: IRecipeItemProps & ICollectedProps) {
  const [show, setShow] = useState(false)

  const drag = !show && props.drag

  const url = props.url || recipeURL(id, name)

  const component = (
    <section
      className={classNames("card", {
        "cursor-move": !!drag
      })}
      style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="card-content h-100 d-flex flex-column">
        <RecipeTitle name={name} url={url} />
        <Meta
          id={id}
          author={author}
          show={show}
          onClose={() => setShow(false)}
          onToggle={() => setShow(prev => !prev)}
        />
      </div>
    </section>
  )

  return drag && connectDragSource
    ? connectDragSource(component, { dropEffect: "copy" })
    : component
}

export interface IRecipeItemDrag {
  readonly recipeID: IRecipeItemProps["id"]
  readonly kind: DragDrop.RECIPE
}

export default DragSource(
  DragDrop.RECIPE,
  {
    beginDrag(props: IRecipeItemProps): IRecipeItemDrag {
      return {
        kind: DragDrop.RECIPE,
        recipeID: props.id
      }
    },
    canDrag(props: IRecipeItemProps): boolean {
      return !!props.drag
    }
  },
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(RecipeItem)
