import React from 'react'
import Recipe from './RecipeItem'
import Loader from './Loader'

import {
  Link
} from 'react-router-dom'

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
    <a className="big-link" href={'/recipes/' + id}>
      {name} by {author}
    </a>.
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
      <p className="stat mb-1">Recently active recipes:</p>
      <section className="recent-recipes-grid">
        { loading
            ? <Loader/>
            : Object.values(recipes).map(recipe =>
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
  const {
    id,
    name,
    author,
    cart_additions: cartAdds
  } = stats.most_added_recipe

  if (loading) {
    return <section className="justify-self-center align-self-center">
      <Loader/>
    </section>
  }

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

const SimpleHome = ({
  loggedIn = false,
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
}) => {
  if (loggedIn) {
    return (
      <div className="font-family-title mt-1rem home-page-grid">
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
      </div>
    )
  }
  return (
    <section className="home-grid">
      <section className="grid-entire-row">
        <h1 className="home-hero-text font-family-title">A place to store, share, and create recipes</h1>
      </section>
      <section className="grid-entire-row mb-4 justify-self-center">
        <Link to='/signup' className='my-button is-primary is-large'>
          Create Account
        </Link>
      </section>
      <section className="grid-entire-row">
        <img className="box-shadow-normal" src="/homepage.png" alt=""/>
      </section>
      <footer className="has-text-centered grid-entire-row fw-bold pt-4 fs-4 font-family-title">
        Est. 2017
      </footer>
    </section>
  )
}

class Home extends React.Component {
  componentWillMount = () => {
    this.props.fetchData()
  }

  render () {
    return <SimpleHome {...this.props} />
  }
}

export default Home
