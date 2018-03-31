import { StateTree } from './store'

export const teamsFrom = (state: StateTree) => state.teams.allIds.map(id => state.teams[id])
