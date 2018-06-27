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
  }

  state = {
    query: ''
  }

  static defaultProps = {
    recipes: []
  }

  componentWillMount () {
    this.props.fetchData(this.props.teamID)
  }

  handleQueryChange = (e) => {
    this.setState({ query: e.target.value })
  }

  render () {
    // TODO(sbdchd): filter by teamID
    const results =
      this.props.recipes
      .filter(recipe => matchesQuery(recipe, this.state.query))
      .map(recipe =>
        <Recipe
          {...recipe}
          drag
          className='mb-0'
          key={ recipe.id }
        />
      )
    return (
      <div>
        <TextInput
          onChange={this.handleQueryChange}
          placeholder='search for recipes'/>

        { this.props.loading
            ? <Loader className="pt-4"/>
            : <div className="recipe-scroll">
                <div className="d-grid grid-gap-4 pt-4">
                  <Results recipes={ results } query={ this.state.query } />
                </div>
              </div>
        }

      </div>
    )
  }
}
