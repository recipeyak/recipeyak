import { useEffect } from "react"
import { RouteComponentProps } from "react-router-dom"

import { ITeam } from "@/api"
import { Helmet } from "@/components/Helmet"
import Recipes from "@/pages/recipe-list/RecipeList.page"
import Calendar from "@/pages/schedule/Calendar"
import HelpMenuModal from "@/pages/schedule/HelpMenuModal"
import { useUserUpdate } from "@/queries/userUpdate"
import { styled } from "@/theme"

interface ISidebarProps {
  readonly teamID: number | "personal"
}

function Sidebar({ teamID }: ISidebarProps) {
  return (
    <div className="d-grid gap-2 grid-auto-rows-min-content w-300px flex-shrink-0 hide-sm mr-2">
      <Recipes teamID={teamID} scroll drag noPadding />
    </div>
  )
}

interface IScheduleProps
  extends RouteComponentProps<{
    id?: string
    type: "shopping" | "recipes"
  }> {
  readonly updateTeamID: (id: ITeam["id"] | null) => void
  readonly teamID: ITeam["id"] | null
}

const ScheduleContainer = styled.div`
  height: calc(100vh - 3rem);
`

function Schedule(props: IScheduleProps) {
  const teamID = getTeamID(props.match.params)

  const updateUser = useUserUpdate()

  useEffect(() => {
    updateUser.mutate({
      schedule_team: teamID,
    })
  }, [updateUser, teamID])

  const teamID_ = teamID || "personal"

  return (
    <ScheduleContainer className="d-flex pl-2 pr-2 flex-grow h-100vh">
      <Helmet title="Schedule" />
      <Sidebar teamID={teamID_} />
      <Calendar teamID={teamID_} />
      <HelpMenuModal />
    </ScheduleContainer>
  )
}

const getTeamID = (params: IScheduleProps["match"]["params"]) => {
  if (params.id == null) {
    return null
  }
  const teamID = parseInt(params.id, 10)
  if (isNaN(teamID)) {
    return null
  }
  return teamID
}

export default Schedule
