export const teamsFrom = state => state.teams.allIds.map(id => state.teams[id]);
export const scheduleURLFrom = state => state.user.scheduleURL || "/schedule";
