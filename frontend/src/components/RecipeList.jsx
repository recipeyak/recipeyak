import React from 'react'
import { Helmet } from 'react-helmet'

import Recipe from './RecipeItem.jsx'
import Loader from './Loader.jsx'

export const matchesQuery = (recipe, query) => {
  const { name, author } = recipe
  query = query.toUpperCase()
  return (name != null && name.toUpperCase().includes(query)) ||
    (author != null && author.toUpperCase().includes(query))
}

const Results = ({ recipes, query, onChange }) => {
  if (recipes.length === 0 && query === '') {
    return <p className="grid-entire-row justify-center">
      No recipes
    </p>
  } else if (recipes.length === 0 && query !== '') {
    return <p className="grid-entire-row justify-center fs-8">
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
    cart: {},
    recipes: {}
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
      cart,
      removeFromCart,
      addToCart,
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
      Object.values(recipes)
      .filter(recipe => matchesQuery(recipe, this.state.query))
      .map(recipe =>
          <Recipe
            {...recipe}
            className='mb-0'
            url={ '/recipes/' + recipe.id }
            inCart={ cart[recipe.id] > 0 ? cart[recipe.id] : 0 }
            key={ recipe.id }
            removeFromCart={ () => removeFromCart(recipe.id)}
            addToCart={ () => addToCart(recipe.id)}
          />
        )

    return (
      <div className="grid-container">
        <Helmet title='Recipes'/>
        <input
          autoFocus
          onChange={ handleInputChange }
          type='search'
          placeholder='search'
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
