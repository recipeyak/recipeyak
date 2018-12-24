import { RootState } from "./store"
import { IUserState } from "./reducers/user"

export const teamsFrom = (state: RootState) =>
  state.teams.allIds.map((id: any) => state.teams[id])

export const scheduleURLFromTeamID = (state: RootState) => {
  const id = (state.user as IUserState).teamID
  if (id == null) {
    return "/schedule/recipes"
  }
  return `/t/${id}/schedule/recipes`
}
