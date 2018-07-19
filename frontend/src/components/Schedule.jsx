import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Helmet } from './Helmet'
import { Link } from 'react-router-dom'

import Calendar from './Calendar'
import Recipes from './Recipes'
import ShoppingList from './ShoppingList'

import {
  setScheduleURL
} from '../store/actions'

const mapDispatchToProps = dispatch => ({
  setURL: (url) => dispatch(setScheduleURL(url))
})

@connect(
  null,
  mapDispatchToProps
)
export default class Schedule extends React.Component {

  static propTypes = {
    error: PropTypes.bool.isRequired,
    match: PropTypes.object.isRequired,
  }

  state = {
    query: '',
    closed: false,
  }

  toggleClose = () => {
    this.setState((prev) => ({ closed: !prev.closed }))
  }

  render () {
    if (this.props.error) {
      return (
        <div className="new-container">
          <Helmet title='Schedule' />
          <p>Error fetching data</p>
        </div>
      )
    }

    const isRecipes = this.props.match.params['type'] === 'recipes'

    const arrow = this.state.closed ? '→' : '←'

    const sideBarStyle = {
      display: this.state.closed ? 'none' : 'grid',
    }

    const isTeam = this.props.match.params.id != null

    const teamID = isTeam
      ? parseInt(this.props.match.params.id, 10)
      : 'personal'

    const recipesURL = teamID === 'personal'
      ? '/schedule/recipes'
      : `/t/${teamID}/schedule/recipes`

    const shoppingURL = teamID === 'personal'
      ? '/schedule/shopping'
      : `/t/${teamID}/schedule/shopping`

    return (
      <div className="d-flex pl-2 pr-2">
        <Helmet title='Schedule' />
        <div className="d-grid grid-gap-4 grid-auto-rows-min-content w-350px-if-not-sm" style={sideBarStyle}>

          <div className="tabs is-boxed mb-0 no-print">
            <ul>
              <li className={ !isRecipes ? 'is-active' : ''}>
                <Link to={shoppingURL} onClick={() => this.props.setURL(shoppingURL)}>Shopping</Link>
              </li>
              <li className={ isRecipes ? 'is-active' : ''}>
                <Link to={recipesURL} onClick={() => this.props.setURL(recipesURL)}>Recipes</Link>
              </li>
            </ul>
          </div>

          { isRecipes
              ? <Recipes teamID={teamID} scroll drag/>
              : <ShoppingList teamID={teamID}/>
          }
        </div>
        <a className="select-none closer text-decoration-none no-print hide-sm"
          onClick={this.toggleClose}>
          { arrow }
        </a>
        <Calendar className="hide-sm" match={this.props.match}/>
      </div>
    )
  }
}
