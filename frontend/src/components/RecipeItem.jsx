import React from 'react'
import { Link } from 'react-router-dom'
import { DragSource } from 'react-dnd'

import DatePickerForm from './DatePickerForm'

import { ButtonPlain } from './Buttons'

import { classNames } from '../classnames'

import {
  recipeURL,
  teamURL,
} from '../urls'

import * as DragDrop from '../dragDrop'

const recipeSource = {
  beginDrag (props) {
    return {
      recipeID: props.id
    }
  },
  canDrag (props) {
    return props.drag
  }
}

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

@DragSource(DragDrop.RECIPE, recipeSource, collect)
export default class RecipeItem extends React.Component {
  state = {
    show: false,
  }

  static defaultProps = {
    drag: false,
  }

  render () {
    const {
      name,
      author,
      id,
      url = recipeURL(id, name),
      owner = {
        type: 'user',
        id: 0,
        name: '',
      },
      connectDragSource,
      isDragging,
    } = this.props

    const ownershipDetail = owner.type === 'team' && owner.name && owner.id
      ? <div className=" text-muted fw-500">
          via <Link to={teamURL(owner.id, owner.name)} className="text-muted bold">{ owner.name }</Link>
        </div>
      : null

    const drag = !this.state.show && this.props.drag

    const component = (
      <div
        className={
          classNames('card', { 'cursor-move': drag })
        }
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}>
        <div className="card-content">
          <div className="title fs-6 d-flex justify-space-between p-rel">
            <Link to={ url }>{ name }</Link>
            <div className="p-rel">
              <ButtonPlain
                onClick={() => this.setState(prev => ({ show: !prev.show }))}
                className="is-small p-relative">
                schedule
              </ButtonPlain>
              <DatePickerForm
                recipeID={id}
                show={this.state.show}
                close={() => this.setState({ show: false })}
              />
            </div>

          </div>
          <p className="subtitle fs-4 mb-0">
            { author }
          </p>
          <div className="content">
            { ownershipDetail }
          </div>

        </div>
      </div>
    )

    return !drag
      ? component
      : connectDragSource(component, { dropEffect: 'copy' })
  }
}
