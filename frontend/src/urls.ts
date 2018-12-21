// we replace spaces since they are pretty common, but leave the reset to
// `encodeURIComponent`
export const toURL = (x = "") => encodeURIComponent(x.replace(/\s/g, "-"))

export const recipeURL = (id: number, name: string) =>
  `/recipes/${id}-${toURL(name)}`
export const teamURL = (id: number, name: string) => `/t/${id}-${toURL(name)}`
export const inviteURL = (teamID: number, name: string) =>
  teamURL(teamID, name) + "/invite"
export const teamSettingsURL = (id: number, name: string) =>
  teamURL(id, name) + "/settings"
