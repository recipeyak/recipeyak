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
    <div className="mr-2 hidden w-[250px] min-w-[250px] shrink-0 auto-rows-min gap-2 sm:grid">
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
      <ScheduleContainer className="flex h-screen grow pl-2 pr-2">
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
