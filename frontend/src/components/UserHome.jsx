import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Loader from './Loader'
import Recipe, { recipeURL } from './RecipeItem'

const RecipesAddedThisWeek = ({ count = 0 }) =>
  count > 0 &&
  <p className="stat mb-1">
    <b>{ count } recipe{ count === 1 ? ' ' : 's '}</b>
    {count === 1 ? 'has' : 'have'} been added in the <b>last week</b>.
  </p>

const LifetimeRecipeEdits = ({ edits = 0, dateJoined = '' }) =>
  edits > 0 && dateJoined !== '' &&
  <p className="stat mb-1">
    Since <b>{ dateJoined }</b>, your recipes have been edited a total of <b>{ edits } times</b>.
  </p>

const MostAddedRecipe = ({
  name = '',
  id,
  author,
  cartAdds = 0
}) =>
  name !== '' && cartAdds > 0 &&
  <p className="stat mb-1">
    <b>By cart additions</b>, your <b>favorite recipe</b> is
    <Link className="big-link" to={recipeURL(id, name)}>
      {name} by {author}
    </Link>.
    You've added it to your cart {cartAdds} time{cartAdds !== 1 && 's'}.
  </p>

const RecentRecipes = ({
  recipes,
  cart,
  loading,
  error,
  removeFromCart,
  addToCart
}) => {
  if (error) return <p>error fetching recipes</p>

  return (
    <section>
      <p className="stat mb-1 text-center">Recently Active Recipes</p>
      <section className="recent-recipes-grid">
        { loading
            ? <Loader/>
            : recipes.map(recipe =>
                <Recipe
                  {...recipe}
                  className='mb-0'
                  inCart={ cart[recipe.id] > 0 ? cart[recipe.id] : 0 }
                  key={ recipe.id }
                  removeFromCart={ () => removeFromCart(recipe.id)}
                  addToCart={ () => addToCart(recipe.id)}
                />
              )
        }
        { !loading
            ? <Link to='/recipes' className='my-button is-primary'>
                See More
              </Link>
            : null
        }
      </section>
    </section>
  )
}

const UserStatistics = ({ loading, stats }) => {
  if (loading) {
    return <section className="justify-self-center d-grid align-self-center">
      <Loader/>
    </section>
  }

  if (stats.most_added_recipe == null) {
    return null
  }

  const {
    id,
    name,
    author,
    cart_additions: cartAdds
  } = stats.most_added_recipe

  return (
    <section>
      <RecipesAddedThisWeek
        count={stats.new_recipes_last_week}
      />
      <LifetimeRecipeEdits
        edits={stats.total_recipe_edits}
        dateJoined={stats.date_joined}
      />
      <MostAddedRecipe
        id={id}
        name={name}
        author={author}
        cartAdds={cartAdds}
      />
    </section>
  )
}

const UserHome = ({
  loadingRecipes,
  loadingUserStats,
  userStats = {
    most_added_recipe: {
      name: '',
      author: ''
    },
    new_recipes_last_week: '',
    total_recipe_edits: null,
    date_joined: null,
    recipes_added_by_month: []
  },
  recipes,
  cart,
  addToCart,
  removeFromCart,
  errorRecipes
}) =>
  <div className="container pr-4 pl-4">
    <Helmet title='Home'/>

    <section className="home-page-grid font-family-title">
      <UserStatistics
        stats={ userStats }
        loading={ loadingUserStats }
      />
      <RecentRecipes
        loading={ loadingRecipes }
        error={ errorRecipes }
        recipes={ recipes }
        cart={ cart }
        removeFromCart={ removeFromCart }
        addToCart={ addToCart }
      />
    </section>
  </div>

class UserHomeFetch extends React.Component {
  componentWillMount = () => {
    this.props.fetchData()
  }
  render () {
    return <UserHome {...this.props}/>
  }
}

export default UserHomeFetch
