import { IState } from "@/store/store"
import { ITeam } from "@/store/reducers/teams"

// TODO(sbdchd): move to respective folder
export const teamsFrom = (state: IState): ITeam[] =>
  state.teams.allIds.map(id => state.teams.byId[id])

export const scheduleURLFromTeamID = (state: IState): string => {
  const id = state.user.teamID
  if (id == null) {
    return "/schedule/recipes"
  }
  return `/t/${id}/schedule/recipes`
}
