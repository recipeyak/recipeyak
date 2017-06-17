import React from 'react'
import Navbar from './Nav.js'
import Recipe from './RecipeItem.js'

const recipes = [
  {
    id: 12345,
    url: '/recipes/123',
    title: 'Curried Roast Chicken, Durban Style',
    tags: ['Entree', 'Chicken', 'Oven', 'Long Prep Time'],
    author: 'Florence Fabricant',
    source: 'https://cooking.nytimes.com/recipes/8930-curried-roast-chicken-durban-style',
  },
  {
    id: 1234,
    url: '/recipes/123',
    title: 'Charlie Bird\'s Farro Salad',
    tags: ['Side', 'Stovetop', 'Long Prep Time'],
    author: 'Melissa Clark',
    source: 'https://cooking.nytimes.com/recipes/1015843-charlie-birds-farro-salad',
  },
  {
    id: 234,
    url: '/recipes/123',
    title: 'Kale Tabbouleh',
    tags: ['Side', 'Stovetop'],
    author: 'Melissa Clark',
    source: 'https://cooking.nytimes.com/recipes/12915-kale-tabbouleh',
  },
  {
    id: 1232344,
    url: '/recipes/123',
    title: 'Takeout-Style Sesame Noodles',
    tags: ['Entree', 'Stovetop', 'Quick'],
    author: 'Sam Sifton',
    source: 'https://cooking.nytimes.com/recipes/9558-takeout-style-sesame-noodles',
  },
  {
    id: 123,
    url: '/recipes/123',
    title: 'Green Goddess Roasted Chicken',
    tags: ['Entree', 'Oven', 'Overnight'],
    author: 'Melissa Clark',
    source: 'https://cooking.nytimes.com/recipes/1015232-green-goddess-roasted-chicken',
  },
]

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
