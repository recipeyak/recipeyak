import React from 'react'
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
    fetchData: () => {
      dispatch(fetchRecipeList())
    },
  }
}

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class Recipes extends React.Component {
  state = {
    query: ''
  }

  static defaultProps = {
    recipes: []
  }

  componentWillMount () {
    this.props.fetchData()
  }

  render () {
    const results =
      this.props.recipes
      .filter(recipe => matchesQuery(recipe, this.state.query))
      .map(recipe =>
        <Recipe
          {...recipe}
          className='mb-0'
          key={ recipe.id }
        />
      )
    return (
      <div className="d-grid grid-gap-4">
        <TextInput
          onChange={e => this.setState({ query: e.target.value })}
          placeholder='search for recipes'/>

        { this.props.loading
            ? <Loader/>
            : <Results recipes={ results } query={ this.state.query } />
        }

      </div>
    )
  }
}

export default Recipes
