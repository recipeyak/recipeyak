// https://gist.github.com/mathewbyrne/1280286
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text

// we replace spaces since they are pretty common, but leave the reset to
// `encodeURIComponent`
export const toURL = (x = ""): string => encodeURIComponent(slugify(x))

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
