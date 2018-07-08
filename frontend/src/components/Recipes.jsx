import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Recipe from './RecipeItem'
import Loader from './Loader'
import { TextInput } from './Forms'
import { matchesQuery } from '../search'
import Results from './Results'

import {
  byNameAlphabetical,
} from '../sorters'

import {
  fetchRecipeList,
} from '../store/actions'

const mapStateToProps = state => {
  return {
    recipes: Object.values(state.recipes)
             .sort(byNameAlphabetical),
    loading: state.loading.recipes,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: (teamID) => {
      dispatch(fetchRecipeList(teamID))
    },
  }
}

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class Recipes extends React.Component {
  static propTypes = {
    fetchData: PropTypes.func.isRequired,
    recipes: PropTypes.arrayOf(PropTypes.object).isRequired,
    loading: PropTypes.bool.isRequired,
    teamID: PropTypes.string.isRequired,
    scroll: PropTypes.bool,
    drag: PropTypes.bool,
  }

  state = {
    query: ''
  }

  static defaultProps = {
    recipes: [],
    scroll: false,
    drag: false,
    teamID: 'personal',
  }

  componentWillMount () {
    this.props.fetchData(this.props.teamID)
  }

  handleQueryChange = (e) => {
    this.setState({ query: e.target.value })
  }

  render () {
    const results =
      this.props.recipes
      .filter(recipe => matchesQuery(recipe, this.state.query))
      .map(recipe =>
        <Recipe
          {...recipe}
          teamID={this.props.teamID}
          drag={this.props.drag}
          className='mb-0'
          key={ recipe.id }
        />
      )

    const scrollClass = this.props.scroll
      ? 'recipe-scroll'
      : ''
    return (
      <div>
        <TextInput
          onChange={this.handleQueryChange}
          placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:"/>

        { this.props.loading
            ? <Loader className="pt-4"/>
            : <div className={scrollClass}>
                <div className="recipe-grid pt-4">
                  <Results recipes={ results } query={ this.state.query } />
                </div>
              </div>
        }

      </div>
    )
  }
}
