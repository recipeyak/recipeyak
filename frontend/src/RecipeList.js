import React from 'react'
import Navbar from './Nav.js'
import Recipe from './RecipeItem.js'

import recipes from './mockup-data.js'

const RecipeList = () => {
  const recipeList = recipes.map(recipe =>
    <div className="grid-item" key={ recipe.id }>
      <Recipe
        id={ recipe.id }
        url={ recipe.url }
        title={ recipe.title }
        tags={ recipe.tags }
        author={ recipe.author }
        source={ recipe.source }/>
    </div>
  )
  return (
    <div className="container">
      <Navbar></Navbar>
      <section className="section">
        <div className="grid-container">{ recipeList }</div>
      </section>
    </div>
  )
}

export default RecipeList
