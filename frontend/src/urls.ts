const toURL = (x = '') => x.replace(/\s/g, '-')

export const recipeURL = (id: number, name: string) => `/recipes/${id}-${toURL(name)}`
export const teamURL = (id: number) => `/t/${id}`
export const inviteURL = (teamID: number) => `/t/${teamID}/invite`
export const teamSettingsURL = (id: number) => teamURL(id) + '/settings'
