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
      token: 'testing',
      routerReducer: {
        location: 'test',
      }
    }

    const afterState = {
      ...emptyStore.getState(),
      routerReducer: beforeState.routerReducer
    }

    expect(
      rootReducer(beforeState, logout())
    ).toEqual(afterState)
  })
})
