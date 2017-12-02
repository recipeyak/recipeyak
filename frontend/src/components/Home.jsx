import React from 'react'

import Signup from '../containers/HomeSignup'

import LineChart from './LineChartMonthRecipes'

import './home.scss'

const SimpleHome = ({
  loggedIn = false,
  userStats = {
    most_viewed_recipe: {
      name: '',
      author: ''
    },
    new_recipes_last_week: '',
    total_views: null,
    date_joined: null,
    recipes_added_by_month: []
  }
  }) => {
  /* Handle missing data */
  const mostViewedRecipe = userStats && userStats.most_viewed_recipe && userStats.most_viewed_recipe.name && userStats.most_viewed_recipe.author
    ? <a href={'/recipes/' + userStats.most_viewed_recipe.id}>{userStats.most_viewed_recipe.name} by {userStats.most_viewed_recipe.author}</a>
    : ''

  let recipesAddedByMonth = []
  /* Add data into chart (we get the months from datetime strings) */
  if (userStats && userStats.recipes_added_by_month) {
    recipesAddedByMonth = userStats.recipes_added_by_month.reduce((acc, { month, c }) => {
      const m = parseInt(month.split('-')[1], 10) - 1
      acc[m] = c
      return acc
    }, new Array(12).fill(0))
  }

  return (
      <div className="home-grid">
        <h1 className="home-hero-text font-family-serif">A place to store, share, and create recipes</h1>

        { !loggedIn
            ? <Signup />
            : (
              userStats && <div className="font-family-serif mt-1rem">
                { userStats.new_recipes_last_week &&
                  <p className="fs-2rem fact">
                    <b>{ userStats.new_recipes_last_week } recipe{ userStats.new_recipes_last_week === 1 ? ' ' : 's '}</b>
                    {userStats.new_recipes_last_week === 1 ? 'has' : 'have'} been added in the <b>last week</b>.</p> }

                { userStats.date_joined && userStats.total_views && <p className="fs-2rem fact">Since <b>{userStats.date_joined}</b>, your recipes have been viewed a total of <b>{ userStats.total_views } times</b>.</p> }

                { mostViewedRecipe && <p className="fs-2rem fact"><b>By views</b>, your <b>favorite recipe</b> is { mostViewedRecipe }</p> }
                <h3 className="fs-2rem fact">Recipes added over the <b>past year</b>:</h3>
                <LineChart data={recipesAddedByMonth}/>
              </div>
            )
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
