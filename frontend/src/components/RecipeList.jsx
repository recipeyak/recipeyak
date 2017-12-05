import React from 'react'

import Recipe from './RecipeItem.jsx'
import Loader from './Loader.jsx'

import 'bulma/css/bulma.css'

import './recipe-list.scss'

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
    return <p className="grid-entire-row justify-center">
      No recipes found matching { query }
    </p>
  }
  return recipes
}

class RecipeList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      query: ''
    }
  }

  componentWillMount () {
    this.props.fetchData()
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render () {
    if (this.props.error) return <p>Error fetching data</p>

    const recipes =
      Object.values(this.props.recipes)
      .filter(recipe => matchesQuery(recipe, this.state.query))
      .map(recipe =>
          <Recipe
            {...recipe}
            className='mb-0'
            url={ '/recipes/' + recipe.id }
            inCart={ this.props.cart[recipe.id] > 0 ? this.props.cart[recipe.id] : 0 }
            key={ recipe.id }
            removeFromCart={ () => this.props.removeFromCart(recipe.id)}
            addToCart={ () => this.props.addToCart(recipe.id)}
          />
        )

    return (
      <div className="grid-container">
        <input autoFocus onChange={ this.handleInputChange } type='search' className='input grid-entire-row' name='query'/>
        { this.props.loading
            ? <Loader/>
            : <Results recipes={ recipes } query={ this.state.query } />
        }
      </div>
    )
  }
}

RecipeList.defaultProps = {
  cart: {},
  recipes: {}
}

export default RecipeList
