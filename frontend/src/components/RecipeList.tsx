import * as React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import Recipe from '../containers/RecipeItem'
import Loader from './Loader'

import { Recipe as IRecipe } from '../store/reducers/recipes'

export const matchesQuery = ({
  name = '',
  author = '',
  ingredients = []
}: IRecipe, query: string) => {
  // https://stackoverflow.com/a/37511463/3720597
  const removeAccents = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const normalize = (x = '') => removeAccents(x).replace(/\W/g, '').toLowerCase()

  // basic search with ability to prepend a tag to query and only search for
  // things relevent to that tag

  name = normalize(name)
  author = normalize(author)

  // get the actual query value from search_space:query_here
  const normalizeQuery = (x: string) => {
    const z = x.split(':')
    return Array.isArray(z)
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

interface IResults {
  recipes: IRecipe[]
  query: string
}
const Results = ({ recipes, query }: IResults) => {
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

interface IRecipeListState {
  query: string
}

interface IRecipeListProps {
  recipes: IRecipe[]
  error: boolean
  fetchData(): void
  loading: boolean
}

class RecipeList extends React.Component<IRecipeListProps,IRecipeListState> {
  state = {
    query: ''
  }

  static defaultProps = {
    recipes: [] as IRecipe[]
  }

  componentWillMount () {
    this.props.fetchData()
  }

  handleInputChange = (e: any) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render () {
    if (this.props.error) return <p>Error fetching data</p>

    const results =
      this.props.recipes
      .filter(recipe => matchesQuery(recipe, this.state.query))
      .map(recipe =>
          <Recipe
            {...recipe}
            key={ recipe.id }
          />
        )

    return (
      <div className="grid-container">
        <Helmet title='Recipes'/>
        <input
          autoFocus
          onChange={ this.handleInputChange }
          value={ this.state.query }
          type='search'
          autoCorrect='off'
          placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:'"
          className='my-input grid-entire-row'
          name='query'/>
        { this.props.loading
            ? <Loader/>
            : <Results recipes={ results } query={ this.state.query } />
        }
      </div>
    )
  }
}

export default RecipeList
