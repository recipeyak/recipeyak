import { IState } from "@/store/store"

export const scheduleURLFromTeamID = (state: IState): string => {
  const id = state.user.scheduleTeamID
  if (id == null) {
    return "/schedule/recipes"
  }
  return `/t/${id}/schedule/recipes`
}
