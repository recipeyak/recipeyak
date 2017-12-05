import user from './user'

import {
  rootReducer,
  emptyStore
} from '../store'

import {
  logout
} from '../actions'

describe('logout', () => {

  it('Logs out user and clears entire store', () => {
    const beforeState = {
      loggedIn: true,
      token: 'testing'
    }

    expect(
      rootReducer(beforeState, logout())
    ).toEqual(emptyStore.getState())
  })

})
