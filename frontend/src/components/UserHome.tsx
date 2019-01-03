import * as React from "react"
import { Helmet } from "@/components/Helmet"
import { Link } from "react-router-dom"

import Loader from "@/components/Loader"
import { RecipeItem as Recipe } from "@/components/RecipeItem"
import { IRecipe } from "@/store/reducers/recipes"
import { IUserStats } from "@/store/reducers/user"
import Footer from "@/components/Footer"
import {
  WebData,
  isInitial,
  isLoading,
  isFailure,
  isSuccess
} from "@/store/remotedata"

// TODO(sbdchd): must be a better way
// tslint:disable-next-line:no-var-requires
const img = require("./images/yak.jpg")

interface ITotalRecipeCountProps {
  readonly count: number
}
const TotalRecipeCount = ({ count }: ITotalRecipeCountProps) => (
  <p className="stat mb-1">
    You have{" "}
    <b>
      {count} recipe{count === 1 ? "" : "s"}
    </b>
    .
    {count < 1 && (
      <span>
        Try adding one via the{" "}
        <Link className="big-link" to="/recipes/add">
          Add Recipe
        </Link>{" "}
        page.
      </span>
    )}
  </p>
)

interface IRecipesAddedThisWeek {
  readonly count: number
}

const RecipesAddedThisWeek = ({ count }: IRecipesAddedThisWeek) => {
  if (count < 1) {
    return null
  }
  return (
    <p className="stat mb-1">
      <b>
        {count} recipe{count === 1 ? " " : "s "}
      </b>
      {count === 1 ? "has" : "have"} been added in the <b>last week</b>.
    </p>
  )
}

const toInt = (x: number) => Math.max(0, x)

interface ILifeTimeRecipeEdits {
  readonly edits: number
  readonly dateJoined: string
}

const LifetimeRecipeEdits = ({ edits, dateJoined }: ILifeTimeRecipeEdits) => {
  if (dateJoined === "") {
    return null
  }
  return (
    <p className="stat mb-1">
      Since <b>{dateJoined}</b>, you have edited your recipes a total of{" "}
      <b>{toInt(edits)} times</b>.
      {edits < 1 ? (
        <span>
          Try the <u>Edit</u> button.
        </span>
      ) : null}
    </p>
  )
}

interface IRecentRecipes {
  readonly recipes: WebData<IRecipe[]>
}

const RecentRecipes = ({ recipes }: IRecentRecipes) => {
  if (isFailure(recipes)) {
    return <p>error fetching recipes</p>
  }

  if (isSuccess(recipes) && recipes.data.length === 0) {
    return (
      <section>
        <section className="d-grid grid-gap-4 justify-content-center">
          <p className="stat-small">No recipes here — just this yak.</p>
          <img
            alt="yak in a field"
            // tslint:disable-next-line:no-unsafe-any
            src={img}
            className="box-shadow-normal br-3 filter-saturate-140"
          />
          <Link to="/recipes/add" className="my-button is-medium is-primary">
            Add a Recipe
          </Link>
        </section>
      </section>
    )
  }

  return (
    <section>
      <p className="stat mb-1 text-center">Recently Active Recipes</p>
      <section className="recent-recipes-grid">
        {isLoading(recipes) || isInitial(recipes) ? (
          <Loader />
        ) : (
          <>
            {recipes.data.map(recipe => (
              <Recipe {...recipe} key={recipe.id} />
            ))}
            <Link to="/recipes" className="my-button is-primary">
              See More
            </Link>
          </>
        )}
      </section>
    </section>
  )
}

interface IUserStatisticsProps {
  readonly stats: WebData<IUserStats>
}

const UserStatistics = (props: IUserStatisticsProps) => {
  if (isInitial(props.stats) || isLoading(props.stats)) {
    return (
      <section className="justify-self-center d-grid align-self-center">
        <Loader />
      </section>
    )
  }

  const stats = isFailure(props.stats)
    ? {
        most_added_recipe: null,
        new_recipes_last_week: 0,
        total_recipe_edits: 0,
        total_user_recipes: 0,
        date_joined: "",
        recipes_added_by_month: [],
        total_recipes_added_last_month_by_all_users: 0
      }
    : props.stats.data

  // NOTE: this breaks sometimes
  const emptyStats = stats.most_added_recipe == null
  if (emptyStats) {
    return (
      <div>
        <p className="stat">
          <b>Welcome!</b>
        </p>
        <p className="stat">
          So far <b>{stats.total_recipes_added_last_month_by_all_users}</b>{" "}
          recipes have been added in the <b>last month</b>.
        </p>
        <p className="stat">
          <Link className="big-link" to="/recipes/add">
            Add some recipes
          </Link>
          and check back later for more stats.
        </p>
      </div>
    )
  }

  return (
    <section>
      <TotalRecipeCount count={stats.total_user_recipes} />
      <RecipesAddedThisWeek count={stats.new_recipes_last_week} />
      <LifetimeRecipeEdits
        edits={stats.total_recipe_edits}
        dateJoined={stats.date_joined || ""}
      />
    </section>
  )
}

interface IUserHomeProps {
  readonly userStats: WebData<IUserStats>
  readonly recipes: WebData<IRecipe[]>
}

const UserHome = ({ userStats, recipes }: IUserHomeProps) => {
  return (
    <>
      <div className="container pr-2 pl-2 pb-2">
        <Helmet title="Home" />

        <section className="home-page-grid font-family-title">
          <UserStatistics stats={userStats} />
          <RecentRecipes recipes={recipes} />
        </section>
      </div>

      <Footer />
    </>
  )
}

interface IUserHomeFetchProps extends IUserHomeProps {
  readonly fetchData: () => void
}

class UserHomeFetch extends React.Component<IUserHomeFetchProps> {
  componentWillMount = () => {
    this.props.fetchData()
  }
  render() {
    return <UserHome {...this.props} />
  }
}

export default UserHomeFetch
