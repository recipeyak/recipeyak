import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Nav.js'
import Recipe from './RecipeItem.js'
import './cart.scss'

// NOTE: For development purposes
import recipes, { ingredients } from './mockup-data.js'
let text = ingredients.join('\n')
for (let i = 0; i < 3; i++) {
  text += text
}

class Cart extends React.Component {
  render () {
    const recipeItems = recipes.map(recipe =>
        <Recipe
            key={ recipe.id }
            title={ recipe.title }
            url={ recipe.url }
            author={ recipe.author }
            source={ recipe.source }
            tags={ recipe.tags }
            inCart={ recipe.inCart }/>)
    return (
    <div>
        <Navbar></Navbar>
        <section className="section">
            <div className="container">
                <div className="columns">
                    <div className="column">
                        <h2 className="title">Recipes</h2>
                        { recipeItems }
                    </div>
                    <div className="column">
                        <h2 className="title"><Link to="/ingredients">Shopping List</Link></h2>
                        <div className="card">
                            <p className="ingredients-list card-content">{ text }</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>)
  }
}

export default Cart
