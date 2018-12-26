import React from "react"
import { Link } from "react-router-dom"
import { DragSource, ConnectDragSource } from "react-dnd"

import DatePickerForm from "./DatePickerForm"

import { ButtonPlain } from "./Buttons"

import { classNames } from "../classnames"

import { teamURL, recipeURL } from "../urls"

import * as DragDrop from "../dragDrop"
import { ITeam } from "../store/reducers/teams"
import { IRecipe } from "../store/reducers/recipes"

const recipeSource = {
  beginDrag(props: IRecipeItemProps) {
    return {
      recipeID: props.id
    }
  },
  canDrag(props: IRecipeItemProps): boolean {
    return !!props.drag
  }
}

interface ICollectedProps {
  readonly connectDragSource?: ConnectDragSource
  readonly isDragging?: boolean
}

interface IRecipeItemProps {
  readonly name: string
  readonly author: string
  readonly id: number
  readonly url?: string
  readonly owner: IRecipe["owner"]
  readonly teamID?: ITeam["id"] | "personal"
  readonly drag?: boolean
}

interface IRecipeItemState {
  readonly show: boolean
}

export class RecipeItem extends React.Component<
  IRecipeItemProps & ICollectedProps,
  IRecipeItemState
> {
  readonly state = {
    show: false
  }

  render() {
    const {
      name,
      author,
      id,
      owner,
      connectDragSource,
      isDragging,
      teamID
    } = this.props

    const ownershipDetail =
      owner.type === "team" && owner.name && owner.id ? (
        <div className=" text-muted fw-500">
          via{" "}
          <Link to={teamURL(owner.id, owner.name)} className="text-muted bold">
            {owner.name}
          </Link>
        </div>
      ) : null

    const drag = !this.state.show && this.props.drag

    const url = this.props.url || recipeURL(id, name)

    const component = (
      <div
        className={classNames("card", { "cursor-move": !!drag })}
        style={{
          opacity: isDragging ? 0.5 : 1
        }}>
        <div className="card-content">
          <div className="title fs-6 d-flex justify-space-between">
            <Link to={url}>{name}</Link>
            <div className="p-rel ml-2">
              <ButtonPlain
                onClick={() => this.setState(prev => ({ show: !prev.show }))}
                className="is-small">
                schedule
              </ButtonPlain>
              <DatePickerForm
                recipeID={id}
                teamID={teamID}
                show={this.state.show}
                close={() => this.setState({ show: false })}
              />
            </div>
          </div>
          <p className="subtitle fs-4 mb-0">{author}</p>
          <div className="content">{ownershipDetail}</div>
        </div>
      </div>
    )

    return drag && connectDragSource
      ? connectDragSource(component, { dropEffect: "copy" })
      : component
  }
}

export default DragSource(
  DragDrop.RECIPE,
  recipeSource,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(RecipeItem)
