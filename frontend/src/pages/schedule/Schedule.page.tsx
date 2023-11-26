import { useEffect } from "react"
import { RouteComponentProps } from "react-router-dom"

import { Helmet } from "@/components/Helmet"
import { NavPage } from "@/components/Page"
import { RecipeSearchList } from "@/components/RecipeSearchList"
import Calendar from "@/pages/schedule/Calendar"
import HelpMenuModal from "@/pages/schedule/HelpMenuModal"
import { useUserUpdate } from "@/queries/userUpdate"
import { styled } from "@/theme"

interface ISidebarProps {
  readonly teamID: number
}

function Sidebar({ teamID }: ISidebarProps) {
  return (
    <div className="hidden sm:grid gap-2 auto-rows-min w-[250px] min-w-[250px] shrink-0 mr-2">
      <RecipeSearchList teamID={teamID} scroll drag noPadding />
    </div>
  )
}

interface IScheduleProps
  extends RouteComponentProps<{
    teamId: string
  }> {}

const ScheduleContainer = styled.div`
  height: calc(100vh - 3rem);
`

export function SchedulePage(props: IScheduleProps) {
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
    <NavPage includeSearch={false} noContainer>
      <ScheduleContainer className="flex pl-2 pr-2 grow h-screen">
        <Helmet title="Schedule" />
        <Sidebar teamID={teamID} />
        <Calendar teamID={teamID} />
        <HelpMenuModal />
      </ScheduleContainer>
    </NavPage>
  )
}

const getTeamID = (params: IScheduleProps["match"]["params"]) => {
  return parseInt(params.teamId, 10)
}
