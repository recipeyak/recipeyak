import { useEffect } from "react"
import { connect } from "react-redux"
import { RouteComponentProps } from "react-router-dom"

import { CurrentKeys } from "@/components/CurrentKeys"
import { Helmet } from "@/components/Helmet"
import Recipes from "@/pages/recipe-list/RecipeList.page"
import Calendar from "@/pages/schedule/Calendar"
import HelpMenuModal from "@/pages/schedule/HelpMenuModal"
import { ITeam } from "@/store/reducers/teams"
import { Dispatch, updatingDefaultScheduleTeamIDAsync } from "@/store/thunks"
import { styled } from "@/theme"

interface ISidebarProps {
  readonly teamID: number | "personal"
}

function Sidebar({ teamID }: ISidebarProps) {
  return (
    <div className="d-grid grid-gap-2 grid-auto-rows-min-content w-300px flex-shrink-0 hide-sm mr-2">
      <Recipes teamID={teamID} scroll drag noPadding />
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
}

const ScheduleContainer = styled.div`
  height: calc(100vh - 3rem);
`

function Schedule({ updateTeamID, teamID }: IScheduleProps) {
  useEffect(() => {
    updateTeamID(teamID)
  }, [updateTeamID, teamID])

  const teamID_ = teamID || "personal"

  return (
    <ScheduleContainer className="d-flex pl-2 pr-2 flex-grow h-100vh">
      <Helmet title="Schedule" />
      <Sidebar teamID={teamID_} />
      <Calendar teamID={teamID_} />
      <CurrentKeys />
      <HelpMenuModal />
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
