import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import Recipe from '../containers/RecipeItem.jsx'
import Loader from './Loader.jsx'

export const matchesQuery = ({
  name = '',
  author = '',
  ingredients = []
}, query) => {
  // https://stackoverflow.com/a/37511463/3720597
  const removeAccents = x => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const normalize = (x = '') => removeAccents(x).replace(/\W/g, '').toLowerCase()

  // basic search with ability to prepend a tag to query and only search for
  // things relevent to that tag

  name = normalize(name)
  author = normalize(author)

  // get the actual query value from search_space:query_here
  const normalizeQuery = x => {
    const z = x.split(':')
    return z.length > 0
      ? normalize(z[1])
      : normalize(z)
  }

  if (query.indexOf('author:') === 0) {
    return author.includes(normalizeQuery(query))
  }

  if (query.indexOf('ingredient:') === 0) {
    return ingredients
      .map(x => normalize(x.name))
      .some(x => x.includes(normalizeQuery(query)))
  }

  if (query.indexOf('name:') === 0) {
    return name.includes(normalizeQuery(query))
  }

  query = normalize(query)

  query = ['author', 'name', 'ingredient']
    .map(x => x + ':')
    .some(x => x.includes(query))
    ? ''
    : query

  return name.includes(query) ||
    author.includes(query)
}

const Results = ({ recipes, query, onChange }) => {
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
    return <p className="grid-entire-row justify-center fs-8 font-family-title">
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
          type='search'
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
