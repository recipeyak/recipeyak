// we replace spaces since they are pretty common, but leave the reset to
// `encodeURIComponent`
export const toURL = (x = "") => encodeURIComponent(x.replace(/\s/g, "-"))

interface IBlah {
  // tslint:disable-next-line: no-any
  toString(x: any): string
}

export const recipeURL = <T extends IBlah>(id: T, name: string) =>
  `/recipes/${id}-${toURL(name)}`
export const teamURL = (id: number, name: string) => `/t/${id}-${toURL(name)}`
export const inviteURL = (teamID: number, name: string) =>
  teamURL(teamID, name) + "/invite"
export const teamSettingsURL = (id: number, name: string) =>
  teamURL(id, name) + "/settings"
