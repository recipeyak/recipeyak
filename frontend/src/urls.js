const toURL = (x = '') => x.replace(/\s/g, '-')

export const recipeURL = (id, name) => `/recipes/${id}-${toURL(name)}`
export const teamURL = id => `/t/${id}`
export const inviteURL = teamID => `/t/${teamID}/invite`
