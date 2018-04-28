import React from 'react'
import { Link } from 'react-router-dom'

import { recipeURL } from '../urls'

class CalendarItem extends React.Component {
  state = {
    count: this.props.count
  }

  componentWillMount () {
    this.setState({ count: this.props.count })
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ count: nextProps.count })
  }

  handleChange = e => {
    const count = e.target.value
    const oldCount = this.state.count
    this.setState({ count })
    this.props.updateCount(count)
      .then(() => this.props.refetchShoppingList())
      .catch(() => this.setState({ count: oldCount }))
  }

  render () {
    return (
      <div className="d-flex align-items-center justify-space-between mb-1">
        <Link
          to={recipeURL(this.props.recipeID, this.props.recipeName)}
          className="break-word fs-3"
          style={{
            lineHeight: 1.1
          }}>
          { this.props.recipeName }
        </Link>
        <div className="d-flex">
          <input
            className="fs-3 my-input text-right w-2rem"
            onChange={ this.handleChange }
            value={ this.state.count } />
        </div>
      </div>
    )
  }
}

export default CalendarItem
