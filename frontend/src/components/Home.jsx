import React from 'react'

import Signup from '../containers/HomeSignup'

import LineChart from './LineChartMonthRecipes'

import './home.scss'

const RecipesAddedThisWeek = ({ count = 0 }) =>
  count > 0 &&
  <p className="fs-2rem fact">
    <b>{ count } recipe{ count === 1 ? ' ' : 's '}</b>
    {count === 1 ? 'has' : 'have'} been added in the <b>last week</b>.
  </p>

const LifetimeRecipeEdits = ({ edits = 0, dateJoined = '' }) =>
  edits > 0 && dateJoined !== '' &&
  <p className="fs-2rem fact">
    Since <b>{ dateJoined }</b>, your recipes have been edited a total of <b>{ edits } times</b>.
  </p>

const MostAddedRecipe = ({ name = '', cartAdds = 0 }) =>
  name !== '' && cartAdds > 0 &&
  <p className="fs-2rem fact">
    <b>By cart additions</b>, your <b>favorite recipe</b> is { name }.
    You've added it to your cart {cartAdds} time{cartAdds !== 1 && 's'}.
  </p>

const UserStatistics = ({ stats }) => {
  let recipesAddedByMonth = []
  /* Add data into chart (we get the months from datetime strings) */
  if (stats && stats.recipes_added_by_month) {
    recipesAddedByMonth = stats.recipes_added_by_month.reduce((acc, { month, c }) => {
      const m = parseInt(month.split('-')[1], 10) - 1
      acc[m] = c
      return acc
    }, new Array(12).fill(0))
  }
  const mostAddedRecipe = stats && stats.most_added_recipe && stats.most_added_recipe.name && stats.most_added_recipe.author
    ? <a href={'/recipes/' + stats.most_added_recipe.id}>{stats.most_added_recipe.name} by {stats.most_added_recipe.author}</a>
    : ''
  const cartAdds = stats && stats.most_added_recipe && stats.most_added_recipe.cart_additions

  return (
  stats &&
  <div className="font-family-serif mt-1rem">
    <RecipesAddedThisWeek count={stats.new_recipes_last_week}/>
    <LifetimeRecipeEdits edits={stats.total_recipe_edits} dateJoined={stats.date_joined}/>
    <MostAddedRecipe name={mostAddedRecipe} cartAdds={cartAdds}/>
    <h3 className="fs-2rem fact">Recipes added over the <b>past year</b>:</h3>
    <LineChart data={recipesAddedByMonth}/>
  </div>
  )
}

const SimpleHome = ({
  loggedIn = false,
  userStats = {
    most_added_recipe: {
      name: '',
      author: ''
    },
    new_recipes_last_week: '',
    total_recipe_edits: null,
    date_joined: null,
    recipes_added_by_month: []
  }
  }) => {
  return (
      <div className="home-grid">
        <h1 className="home-hero-text font-family-serif">A place to store, share, and create recipes</h1>

        { !loggedIn
            ? <Signup />
            : <UserStatistics stats={userStats}/>
        }
        <footer className="has-text-centered grid-entire-row fw-bold pt-4 fs-4 font-family-serif">
          Est. 2017
        </footer>
    </div>
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
