import type { ITeam } from "@/store/reducers/teams"
import type { IState } from "@/store/store"
import { notUndefined } from "@/utils/general"

// TODO(sbdchd): move to respective folder
export const teamsFrom = (state: IState): ITeam[] =>
  state.teams.allIds.map((id) => state.teams.byId[id]).filter(notUndefined)

export const scheduleURLFromTeamID = (state: IState): string => {
  const id = state.user.scheduleTeamID
  if (id == null) {
    return "/schedule/recipes"
  }
  return `/t/${id}/schedule/recipes`
}
