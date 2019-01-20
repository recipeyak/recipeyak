import React from "react"
import { Link } from "react-router-dom"
import { DragSource, ConnectDragSource } from "react-dnd"
import DatePickerForm from "@/components/DatePickerForm"
import { ButtonPlain } from "@/components/Buttons"
import { classNames } from "@/classnames"
import { teamURL, recipeURL } from "@/urls"
import * as DragDrop from "@/dragDrop"
import { IRecipe } from "@/store/reducers/recipes"
import Dropdown from "@/components/Dropdown"

interface IRecipeTitleProps {
  readonly url: string
  readonly name: string
  readonly author: string
}

function RecipeTitle({ url, name, author }: IRecipeTitleProps) {
  return (
    <section className="flex-grow-1">
      <div className="title fs-6 d-flex justify-space-between">
        <Link tabIndex={0} to={url}>
          {name}
        </Link>
      </div>
      {author !== "" && <p className="subtitle fs-4 mb-0">{author}</p>}
    </section>
  )
}

interface IViaProps {
  readonly owner: IRecipe["owner"]
}

function Via({ owner }: IViaProps) {
  if (owner.type === "team" && owner.name && owner.id) {
    return (
      <div className="text-muted fw-500">
        via{" "}
        <Link to={teamURL(owner.id, owner.name)} className="text-muted bold">
          {owner.name}
        </Link>
      </div>
    )
  }
  return <div />
}

interface IScheduleProps {
  readonly show: boolean
  readonly id: IRecipe["id"]
  readonly onClose: () => void
  // tslint:disable-next-line:no-any
  readonly trigger: React.ReactElement<any>
}

export class Schedule extends React.Component<IScheduleProps> {
  render() {
    const { id, show, onClose, trigger } = this.props
    return (
      <Dropdown onClose={onClose} show={show} trigger={trigger}>
        <DatePickerForm recipeID={id} show={show} close={onClose} />
      </Dropdown>
    )
  }
}

interface IRecipeItemProps {
  readonly name: string
  readonly author: string
  readonly id: number
  readonly url?: string
  readonly owner: IRecipe["owner"]
  readonly drag?: boolean
}

interface ICollectedProps {
  readonly connectDragSource?: ConnectDragSource
  readonly isDragging?: boolean
}

interface IRecipeItemState {
  readonly show: boolean
}

export class RecipeItem extends React.Component<
  IRecipeItemProps & ICollectedProps,
  IRecipeItemState
> {
  state = {
    show: false
  }

  render() {
    const {
      name,
      author,
      id,
      owner,
      connectDragSource,
      isDragging
    } = this.props

    const drag = !this.state.show && this.props.drag

    const url = this.props.url || recipeURL(id, name)

    const component = (
      <section
        className={classNames("card", {
          "cursor-move": !!drag
        })}
        style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div className="card-content h-100 d-flex flex-column">
          <RecipeTitle name={name} author={author} url={url} />

          <div className="content d-flex align-items-center justify-space-between">
            <Via owner={owner} />
            <Schedule
              id={id}
              show={this.state.show}
              onClose={() =>
                this.setState({
                  show: false
                })
              }
              trigger={
                <ButtonPlain
                  size="small"
                  onClick={() => this.setState(prev => ({ show: !prev.show }))}>
                  schedule
                </ButtonPlain>
              }
            />
          </div>
        </div>
      </section>
    )

    return drag && connectDragSource
      ? connectDragSource(component, { dropEffect: "copy" })
      : component
  }
}

export default DragSource(
  DragDrop.RECIPE,
  {
    beginDrag(props: IRecipeItemProps) {
      return {
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
