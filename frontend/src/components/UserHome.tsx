import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Loader from './Loader'
import { recipeURL } from '../urls'
import Recipe from '../containers/RecipeItem'

const img = require('./images/yak.jpg')

import { Recipe as IRecipe } from '../store/reducers/recipes'

interface MostAddedRecipe {
  id: number
  name: string
  author: string
  total_cart_additions: number
}

interface Stats {
  most_added_recipe: MostAddedRecipe
  new_recipes_last_week: number
  total_recipe_edits: number
  date_joined: string
  recipes_added_by_month: IRecipe[]
  total_cart_additions: number
  total_recipes_added_last_month_by_all_users: number
  total_user_recipes: number
}

interface UserHomeProps {
  fetchData(): void
  loadingRecipes: boolean
  loadingUserStats: boolean
  userStats: Stats
  recipes: IRecipe[]
  errorRecipes: boolean
}

const TotalRecipeCount = ({ count = 0 }) =>
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

const toInt = (x: number) => x > 0 ? x : 0

const LifetimeRecipeEdits = ({
  edits = 0,
  dateJoined = ''
}) =>
  dateJoined !== '' &&
    <p className="stat mb-1">
      Since <b>{ dateJoined }</b>, you have edited your recipes a total of <b>{ toInt(edits) } times</b>.
      { edits < 1 ? <span>Try the <u>Edit</u> button.</span> : null }
    </p>

const recipeTitle = ({ name = '', author = '' }) => {
  if (author == null || author === '') {
    return name
  }
  return `${name} by ${author}`
}

interface IMostAddedRecipe {
  id: number
  name: string
  author: string
  cartAdds: number
}

const MostAddedRecipe = ({
  name = '',
  id,
  author,
  cartAdds = 0
}: IMostAddedRecipe) =>
  name !== '' && cartAdds > 0
    ? <p className="stat mb-1">
        <b>By cart additions</b>, your <b>favorite recipe</b> is
        <Link className="big-link" to={recipeURL(id, name)}>
          { recipeTitle({ name, author }) }
        </Link>.
        You've added it to your cart <b>{cartAdds}</b> time{cartAdds !== 1 && 's'}.
      </p>
    : <p className="stat mb-1">
        You haven't added a recipe to your cart yet. <Link className="big-link" to="/recipes/">Give it a shot!</Link>
      </p>

interface IRecentRecipes {
  recipes: IRecipe[]
  loading: boolean
  error: boolean
}
const RecentRecipes = ({
  recipes,
  loading,
  error
}: IRecentRecipes) => {
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

interface UserStatistics {
  loading: boolean
  stats: Stats
}
const UserStatistics = ({ loading, stats }: UserStatistics) => {
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
        <b>{ stats.total_cart_additions }</b> cart additions have been made by <b>all users</b>.
      </p>
      <p className="stat">
        <Link className="big-link" to="/recipes/add">Add some recipes</Link>
        and check back later for more stats.
      </p>
    </div>
  }

  const {
    id,
    name,
    author,
    total_cart_additions: cartAdds
  } = stats.most_added_recipe

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
      <MostAddedRecipe
        id={id}
        name={name}
        author={author}
        cartAdds={cartAdds}
      />
    </section>
  )
}


class UserHomeFetch extends React.Component<UserHomeProps,{}> {
  componentWillMount() {
    this.props.fetchData()
  }
  render () {
    const {
      loadingRecipes,
      loadingUserStats,
      userStats,
      recipes,
      errorRecipes,
    } = this.props
    return (
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
    )
  }
}

export default UserHomeFetch
