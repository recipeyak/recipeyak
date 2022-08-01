import { useEffect } from "react"
import { connect } from "react-redux"
import { Helmet } from "@/components/Helmet"
import { Link, RouteComponentProps } from "react-router-dom"

import Calendar from "@/components/Calendar"
import Recipes from "@/components/RecipeList"
import ShoppingList from "@/components/ShoppingList"

import { Dispatch, updatingDefaultScheduleTeamIDAsync } from "@/store/thunks"
import { Tabs, Tab } from "@/components/Tabs"
import { ITeam } from "@/store/reducers/teams"
import { styled } from "@/theme"

interface ISidebarProps {
  readonly isRecipes: boolean
  readonly teamID: number | "personal"
}

function Sidebar({ teamID, isRecipes }: ISidebarProps) {
  const recipesURL =
    teamID === "personal"
      ? "/schedule/recipes"
      : `/t/${teamID}/schedule/recipes`

  const shoppingURL =
    teamID === "personal"
      ? "/schedule/shopping"
      : `/t/${teamID}/schedule/shopping`

  return (
    <div className="d-grid grid-gap-2 grid-auto-rows-min-content w-300px flex-shrink-0 hide-sm mr-2">
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

const ScheduleContainer = styled.div`
  height: calc(100vh - 3rem);
`

function Schedule({ updateTeamID, teamID, type }: IScheduleProps) {
  useEffect(() => {
    updateTeamID(teamID)
  }, [updateTeamID, teamID])

  const teamID_ = teamID || "personal"

  const isRecipes = type === "recipes"

  return (
    <ScheduleContainer className="d-flex pl-2 pr-2 flex-grow h-100vh">
      <Helmet title="Schedule" />
      <Sidebar teamID={teamID_} isRecipes={isRecipes} />
      <Calendar type={type} teamID={teamID_} />
    </ScheduleContainer>
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
      updateTeamID: updatingDefaultScheduleTeamIDAsync(dispatch),
      teamID,
      type: ownProps.match.params["type"],
    }
  },
)(Schedule)
