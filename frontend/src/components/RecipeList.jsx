import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import Recipe from '../containers/RecipeItem.jsx'
import Loader from './Loader.jsx'

import { matchesQuery } from '../search'

export const Results = ({ recipes, query }) => {
  if (recipes.length === 0 && query === '') {
    return (
      <section className="d-flex grid-entire-row justify-center">
        <p className="fs-8 font-family-title mr-2">
          No recipes here.
        </p>

        <Link to='/recipes/add' className='my-button is-medium is-primary'>
          Add a Recipe
        </Link>
      </section>
    )
  } else if (recipes.length === 0 && query !== '') {
    return <p className="grid-entire-row justify-center fs-6 font-family-title break-word">
      No recipes found matching <strong>{ query }</strong>
    </p>
  }
  return recipes
}

class RecipeList extends React.Component {
  state = {
    query: ''
  }

  static defaultProps = {
    recipes: []
  }

  componentWillMount = () => {
    this.props.fetchData()
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render () {
    const {
      error,
      recipes,
      loading
    } = this.props

    const {
      handleInputChange
    } = this

    const {
      query
    } = this.state

    if (error) return <p>Error fetching data</p>

    const results =
      recipes
      .filter(recipe => matchesQuery(recipe, query))
      .map(recipe =>
          <Recipe
            {...recipe}
            className='mb-0'
            key={ recipe.id }
          />
        )

    return (
      <div className="grid-container">
        <Helmet title='Recipes'/>
        <input
          autoFocus
          onChange={ handleInputChange }
          value={ this.state.query }
          type='search'
          autoCorrect='off'
          placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:'"
          className='my-input grid-entire-row'
          name='query'/>
        { loading
            ? <Loader/>
            : <Results recipes={ results } query={ query } />
        }
      </div>
    )
  }
}

export default RecipeList
