import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Loader from './Loader'
import Recipe from './RecipeItem'

import img from './images/yak.jpg'

const TotalRecipeCount = ({ count }) =>
  <p className="stat mb-1">
    You have <b>{ count } recipe{ count === 1 ? '' : 's'}</b>.
    { count < 1 &&
      <span>Try adding one via the <Link className="big-link" to="/recipes/add">Add Recipe</Link> page.</span>
    }
  </p>

const RecipesAddedThisWeek = ({ count = 0 }) =>
  count > 0 &&
  <p className="stat mb-1">
    <b>{ count } recipe{ count === 1 ? ' ' : 's '}</b>
    {count === 1 ? 'has' : 'have'} been added in the <b>last week</b>.
  </p>

const toInt = x => x > 0 ? x : 0

const LifetimeRecipeEdits = ({
  edits = 0,
  dateJoined = ''
}) =>
  dateJoined !== '' &&
    <p className="stat mb-1">
      Since <b>{ dateJoined }</b>, you have edited your recipes a total of <b>{ toInt(edits) } times</b>.
      { edits < 1 ? <span>Try the <u>Edit</u> button.</span> : null }
    </p>

const RecentRecipes = ({
  recipes,
  loading,
  error
}) => {
  if (error) return <p>error fetching recipes</p>

  const noRecipes = recipes.length < 1
  if (noRecipes && !loading) {
    return <section>
      <section className="d-grid grid-gap-4 justify-content-center">
        <p className="stat-small">No recipes here — just this yak.</p>
        <img alt='yak in a field' src={ img } className="box-shadow-normal br-3 filter-saturate-140"/>
          <Link to='/recipes/add' className='my-button is-medium is-primary'>
            Add a Recipe
          </Link>
      </section>
    </section>
  }

  return (
    <section>
      <p className="stat mb-1 text-center">Recently Active Recipes</p>
      <section className="recent-recipes-grid">
        { loading
            ? <Loader/>
            : recipes.map(recipe =>
                <Recipe
                  {...recipe}
                  noDrag
                  className='mb-0'
                  key={ recipe.id }
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

  // NOTE: this breaksbsometimes
  const emptyStats = stats.most_added_recipe == null
  if (emptyStats) {
    return <div>
      <p className="stat">
        <b>Welcome!</b>
      </p>
      <p className="stat">
        So far <b>{ stats.total_recipes_added_last_month_by_all_users }</b> recipes have been added in the <b>last month</b>.
      </p>
      <p className="stat">
        <Link className="big-link" to="/recipes/add">Add some recipes</Link>
        and check back later for more stats.
      </p>
    </div>
  }

  return (
    <section>
      <TotalRecipeCount
        count={stats.total_user_recipes}
      />
      <RecipesAddedThisWeek
        count={stats.new_recipes_last_week}
      />
      <LifetimeRecipeEdits
        edits={stats.total_recipe_edits}
        dateJoined={stats.date_joined}
      />
    </section>
  )
}

const UserHome = ({
  loadingRecipes,
  loadingUserStats,
  userStats = {
    most_added_recipe: null,
    new_recipes_last_week: '',
    total_recipe_edits: null,
    date_joined: null,
    recipes_added_by_month: []
  },
  errorRecipes,
  recipes,
}) =>
  <div className="container pr-2 pl-2 pb-2">
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
