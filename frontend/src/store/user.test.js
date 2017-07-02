import user from './user.js'

it('Logs in user', () => {
  const beforeState = {
    loggedIn: false
  }
  const afterState = {
    loggedIn: true
  }
  expect(
    user(beforeState, {type: 'LOG_IN'})
    ).toEqual(afterState)
})

it('Logs out user', () => {
  const beforeState = {
    loggedIn: true
  }
  const afterState = {
    loggedIn: false
  }
  expect(
    user(beforeState, {type: 'LOG_OUT'})
    ).toEqual(afterState)
})

