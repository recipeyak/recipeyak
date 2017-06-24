import React from 'react'
import Navbar from './Nav.js'
import Recipe from './RecipeItem.js'

import recipes from './mockup-data.js'

import 'bulma/css/bulma.css'

const RecipeList = () => {
  const recipeList = recipes.map(recipe =>
    <div className="grid-item" key={ recipe.id }>
      <Recipe
        id={ recipe.id }
        url={ recipe.url }
        title={ recipe.title }
        tags={ recipe.tags }
        addToCart={ () => console.log('addToCart', recipe.id)}
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
    </div>
  )
}

export default RecipeList
