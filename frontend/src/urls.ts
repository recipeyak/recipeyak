import kebabCase from "lodash/kebabCase"

// we use `encodeURIComponent` for good measure
export const toURL = (x = ""): string => encodeURIComponent(kebabCase(x))

interface IStr {
  readonly toString: () => string
}

export const recipeURL = <T extends IStr, U extends IStr>(
  id: T,
  name?: U
): string => {
  const baseUrl = `/recipes/${id}`
  if (name) {
    return baseUrl + "-" + toURL(String(name))
  }
  return baseUrl
}
export const teamURL = (id: number, name: string): string =>
  `/t/${id}-${toURL(name)}`
export const inviteURL = (teamID: number, name: string): string =>
  teamURL(teamID, name) + "/invite"
export const teamSettingsURL = (id: number, name: string): string =>
  teamURL(id, name) + "/settings"
