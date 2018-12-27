import { RootState } from "@/store/store"
import { ITeam } from "@/store/reducers/teams"

export const teamsFrom = (state: RootState): ITeam[] =>
  state.teams.allIds.map(id => state.teams[id])

export const scheduleURLFromTeamID = (state: RootState): string => {
  const id = state.user.teamID
  if (id == null) {
    return "/schedule/recipes"
  }
  return `/t/${id}/schedule/recipes`
}
