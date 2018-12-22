import { RootState } from "./store"

export const teamsFrom = (state: RootState) =>
  state.teams.allIds.map((id: any) => state.teams[id])
export const scheduleURLFrom = (state: RootState) =>
  state.user.scheduleURL || "/schedule"
