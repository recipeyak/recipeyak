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
  readonly teamID: number
}

function Sidebar({ teamID }: ISidebarProps) {
  return (
    <div className="d-grid gap-2 grid-auto-rows-min-content w-250px flex-shrink-0 hide-sm mr-2">
      <Recipes teamID={teamID} scroll drag noPadding />
    </div>
  )
}

interface IScheduleProps
  extends RouteComponentProps<{
    id: string
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
  const updateUserMutate = updateUser.mutate

  // TODO: this is sketchy and resulted in a infinite loop before
  useEffect(() => {
    updateUserMutate({
      schedule_team: teamID,
    })
  }, [updateUserMutate, teamID])

  return (
    <ScheduleContainer className="d-flex pl-2 pr-2 flex-grow h-100vh">
      <Helmet title="Schedule" />
      <Sidebar teamID={teamID} />
      <Calendar teamID={teamID} />
      <HelpMenuModal />
    </ScheduleContainer>
  )
}

const getTeamID = (params: IScheduleProps["match"]["params"]) => {
  return parseInt(params.id, 10)
}

export default Schedule
