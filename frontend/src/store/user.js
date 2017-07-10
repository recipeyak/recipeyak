export const user = (state = {}, action) => {
  switch (action.type) {
    case 'LOG_IN':
      return Object.assign({}, state, { loggedIn: true })
    case 'LOG_OUT':
      return Object.assign({}, state, { loggedIn: false })
    default:
      return state
  }
}

export default user
