import { kebabCase } from "lodash-es"

import { pathRecipeDetail, pathTeamDetail } from "@/paths"

// we use `encodeURIComponent` for good measure
export const toURL = (x = ""): string => encodeURIComponent(kebabCase(x))

interface IStr {
  readonly toString: () => string
}

export const recipeURL = <T extends IStr, U extends IStr>(
  id: T,
  name?: U,
): string => {
  const baseUrl = pathRecipeDetail({ recipeId: id.toString() })
  if (name) {
    return baseUrl + "-" + toURL(String(name))
  }
  return baseUrl
}
export const teamURL = (id: number, name: string): string => {
  return pathTeamDetail({ teamId: id.toString() }) + `-${toURL(name)}`
}
export const inviteURL = (teamID: number, name: string): string =>
  teamURL(teamID, name) + "/invite"
export const teamSettingsURL = (id: number, name: string): string =>
  teamURL(id, name) + "/settings"
