import { kebabCase } from "lodash-es"

import { pathCookDetail, pathRecipeDetail, pathTeamDetail } from "@/paths"

// we use `encodeURIComponent` for good measure
export const toURL = (x = ""): string => encodeURIComponent(kebabCase(x))

export const recipeURL = (id: string | number, name?: string): string => {
  const baseUrl = pathRecipeDetail({ recipeId: id.toString() })
  if (name) {
    return baseUrl + "-" + toURL(String(name))
  }
  return baseUrl
}
export const cookDetailURL = (id: string | number, name?: string): string => {
  const baseUrl = pathCookDetail({ recipeId: id.toString() })
  if (name) {
    return baseUrl + "-" + toURL(String(name))
  }
  return baseUrl
}
export const teamURL = (id: number, name: string): string => {
  return pathTeamDetail({ teamId: id.toString() }) + `-${toURL(name)}`
}
export const teamSettingsURL = (id: number, name: string): string =>
  teamURL(id, name) + "/settings"
