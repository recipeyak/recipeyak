import React, { useEffect } from "react"
import { connect } from "react-redux"
import { Helmet } from "@/components/Helmet"
import { Link } from "react-router-dom"
import { RouteComponentProps } from "react-router-dom"

import Calendar from "@/components/Calendar"
import Recipes from "@/components/RecipeList"
import ShoppingList from "@/components/ShoppingList"

import { Dispatch, updatingTeamIDAsync } from "@/store/thunks"
import { Tabs, Tab } from "@/components/Tabs"
import { ITeam } from "@/store/reducers/teams"

interface ISidebarProps {
  readonly isRecipes: boolean
  readonly teamID: TeamID
}

function Sidebar({ teamID, isRecipes }: ISidebarProps) {
  const [closed, setClosed] = React.useState(false)

  const arrow = closed ? "→" : "←"

  const sideBarStyle = {
    display: closed ? "none" : ""
  }

  const recipesURL =
    teamID === "personal"
      ? "/schedule/recipes"
      : `/t/${teamID}/schedule/recipes`

  const shoppingURL =
    teamID === "personal"
      ? "/schedule/shopping"
      : `/t/${teamID}/schedule/shopping`

  const toggleClose = React.useCallback(() => {
    setClosed(prev => !prev)
  }, [])

  return (
    <>
      <div
        className="d-grid grid-gap-2 grid-auto-rows-min-content w-300px flex-shrink-0 hide-sm"
        style={sideBarStyle}>
        <Tabs small className="mb-0 no-print">
          <Tab isActive={!isRecipes}>
            <Link to={shoppingURL}>Shopping</Link>
          </Tab>
          <Tab isActive={isRecipes}>
            <Link to={recipesURL}>Recipes</Link>
          </Tab>
        </Tabs>

        {isRecipes ? (
          <Recipes teamID={teamID} scroll drag noPadding />
        ) : (
          <ShoppingList teamID={teamID} />
        )}
      </div>
      <a
        className="select-none closer text-decoration-none no-print hide-sm"
        onClick={toggleClose}>
        {arrow}
      </a>
    </>
  )
}

export type ScheduleRouteParams = RouteComponentProps<{
  id?: string
  type: "shopping" | "recipes"
}>

interface IScheduleProps {
  readonly updateTeamID: (id: ITeam["id"] | null) => void
  readonly teamID: ITeam["id"] | null
  readonly type: "shopping" | "recipes"
}

function Schedule(props: IScheduleProps) {
  useEffect(() => {
    props.updateTeamID(props.teamID)
  }, [props.teamID])

  const teamID = props.teamID || "personal"

  const isRecipes = props.type === "recipes"

  return (
    <div className="d-flex pl-2 pr-2 schedule-height">
      <Helmet title="Schedule" />
      <Sidebar teamID={teamID} isRecipes={isRecipes} />
      <Calendar type={props.type} teamID={teamID} />
    </div>
  )
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

export default connect(
  null,
  (dispatch: Dispatch, ownProps: ScheduleRouteParams) => {
    const teamID = getTeamID(ownProps.match.params)
    return {
      updateTeamID: updatingTeamIDAsync(dispatch),
      teamID,
      type: ownProps.match.params["type"]
    }
  }
)(Schedule)
