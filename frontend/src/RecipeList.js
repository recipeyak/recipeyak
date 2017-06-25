import React from 'react'
import Navbar from './Nav.js'
import Recipe from './RecipeItem.js'
import { observer, inject } from 'mobx-react'

import 'bulma/css/bulma.css'

const RecipeList = inject('store')(observer((props) => {
  const recipeList = props.store.recipes.map(recipe =>
    <div className="grid-item" key={ recipe.id }>
      <Recipe
        key={ recipe.id }
        id={ recipe.id }
        url={ recipe.url }
        title={ recipe.title }
        tags={ recipe.tags }
        inCart={ recipe.inCart }
        removeFromCart={ () => props.store.removeFromCart(recipe.id)}
        addToCart={ () => props.store.addToCart(recipe.id)}
        author={ recipe.author }
        source={ recipe.source }/>
    </div>
  )
  return (
    <div className="container">
      <Navbar/>
      <section className="section">
        <div className="grid-container">{ recipeList }</div>
      </section>
      {/* For debug */}
      <pre>{JSON.stringify(props.store.recipes, null, 2)}</pre>
    </div>
  )
}))

export default RecipeList
