import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Calendar from './Calendar'
import Recipes from './Recipes'
import ShoppingList from './ShoppingList'

class Schedule extends React.Component {

  state = {
    query: '',
    closed: false,
  }

  toggleClose = () => {
    this.setState((prev) => ({ closed: !prev.closed }))
  }

  render () {
    const {
      error,
    } = this.props

    if (error) {
      return (
        <div className="new-container">
          <Helmet title='Schedule' />
          <p>Error fetching data</p>
        </div>
      )
    }

    const isRecipes = this.props.match.params['type'] === 'recipes'

    const arrow = this.state.closed ? '→' : '←'

    return (
      <div className="d-flex pl-2 pr-2">
        <Helmet title='Schedule' />
        <div className="d-grid grid-gap-4 grid-auto-rows-min-content w-350px" style={{
          display: this.state.closed ? 'none' : 'grid',
        }}>

          <div className="tabs is-boxed mb-0">
            <ul>
              <li className={ !isRecipes ? 'is-active' : ''}>
                <Link to="/shopping">Shopping</Link>
              </li>
              <li className={ isRecipes ? 'is-active' : ''}>
                <Link to="/recipes">Recipes</Link>
              </li>
            </ul>
          </div>

          { isRecipes
              ? <Recipes />
              : <ShoppingList />
          }
        </div>
        <a className="select-none closer text-decoration-none"
          onClick={this.toggleClose}>
          { arrow }
        </a>
        <Calendar/>
      </div>
    )
  }
}

export default Schedule
