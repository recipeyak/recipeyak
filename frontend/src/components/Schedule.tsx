import React from "react"
import { connect } from "react-redux"
import { Helmet } from "./Helmet"
import { Link } from "react-router-dom"
import { RouteComponentProps } from "react-router-dom"

import Calendar from "./Calendar"
import Recipes from "./Recipes"
import ShoppingList from "./ShoppingList"

import { setScheduleURL, Dispatch } from "../store/actions"

export type ScheduleRouteParams = RouteComponentProps<{
  id?: string
  type: "shopping" | "recipes"
}>

interface IScheduleProps extends ScheduleRouteParams {
  readonly setURL: (url: string) => void
  readonly teamID: number | null
  readonly type: "shopping" | "recipes"
}

interface IScheduleState {
  readonly query: string
  readonly closed: boolean
}

class Schedule extends React.Component<IScheduleProps, IScheduleState> {
  state: IScheduleState = {
    query: "",
    closed: false
  }

  toggleClose = () => {
    this.setState(prev => ({ closed: !prev.closed }))
  }

  render() {
    const isRecipes = this.props.type === "recipes"

    const arrow = this.state.closed ? "→" : "←"

    const sideBarStyle = {
      display: this.state.closed ? "none" : "grid"
    }

    const teamID = this.props.teamID || "personal"

    const recipesURL =
      teamID === "personal"
        ? "/schedule/recipes"
        : `/t/${teamID}/schedule/recipes`

    const shoppingURL =
      teamID === "personal"
        ? "/schedule/shopping"
        : `/t/${teamID}/schedule/shopping`

    return (
      <div className="d-flex pl-2 pr-2">
        <Helmet title="Schedule" />
        <div
          className="d-grid grid-gap-4 grid-auto-rows-min-content w-350px-if-not-sm"
          style={sideBarStyle}>
          <div className="tabs is-boxed mb-0 no-print">
            <ul>
              <li className={!isRecipes ? "is-active" : ""}>
                <Link
                  to={shoppingURL}
                  onClick={() => this.props.setURL(shoppingURL)}>
                  Shopping
                </Link>
              </li>
              <li className={isRecipes ? "is-active" : ""}>
                <Link
                  to={recipesURL}
                  onClick={() => this.props.setURL(recipesURL)}>
                  Recipes
                </Link>
              </li>
            </ul>
          </div>

          {isRecipes ? (
            <Recipes teamID={teamID} scroll drag />
          ) : (
            <ShoppingList teamID={teamID} />
          )}
        </div>
        <a
          className="select-none closer text-decoration-none no-print hide-sm"
          onClick={this.toggleClose}>
          {arrow}
        </a>
        <Calendar className="hide-sm" type={this.props.type} teamID={teamID} />
      </div>
    )
  }
}

const getTeamID = (params: ScheduleRouteParams["match"]["params"]) => {
  if (params.id == null) {
    return null
  }
  const teamID = parseInt(params.id, 10)
  if (isNaN(teamID)) {
    return null
  }
  return teamID
}

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ScheduleRouteParams
) => ({
  setURL: (url: string) => dispatch(setScheduleURL(url)),
  teamID: getTeamID(ownProps.match.params),
  type: ownProps.match.params["type"]
})

export default connect(
  null,
  mapDispatchToProps
)(Schedule)
