const notBool = x => typeof x !== 'boolean'

export const teamsFrom = state => Object.values(state.teams).filter(notBool)
