import React from 'react'
import { connect } from 'react-redux'

import Recipe from './RecipeItem'
import Loader from './Loader'
import { TextInput } from './Forms'
import { matchesQuery } from '../search'
import Results from './Results'
import Scroll from './Scroll'

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
export default class Recipes extends React.Component {
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
          drag
          className='mb-0'
          key={ recipe.id }
        />
      )
    return (
      <div>
        <TextInput
          onChange={e => this.setState({ query: e.target.value })}
          placeholder='search for recipes'/>

        { this.props.loading
            ? <Loader className="pt-4"/>
            : <Scroll height='700px' padding="1px">
                <div className="d-grid grid-gap-4 pt-4">
                  <Results recipes={ results } query={ this.state.query } />
                </div>
              </Scroll>
        }

      </div>
    )
  }
}
