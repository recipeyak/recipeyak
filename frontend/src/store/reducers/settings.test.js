import cart from './cart.js'

import {
  setLoadingPasswordUpdate,
  setErrorPasswordUpdate
} from '../actions.js'

describe('Settings', () => {
  it('sets the loading state of the updating password', () => {
    const beforeState = {}

    const afterState = {
      loadingPasswordUpdate: true
    }

    expect(
      cart(beforeState, setLoadingPasswordUpdate(beforeState, true))
    ).toEqual(afterState)

    const anotherAfterState = {
      loadingPasswordUpdate: false
    }

    expect(
      cart(beforeState, setLoadingPasswordUpdate(beforeState, false))
    ).toEqual(anotherAfterState)
  })

  it('sets the error state of the updating password', () => {
    const beforeState = {}

    const afterState = {
      errorPasswordUpdate: true
    }

    expect(
      cart(beforeState, setErrorPasswordUpdate(beforeState, true))
    ).toEqual(afterState)

    const anotherAfterState = {
      errorPasswordUpdate: false
    }

    expect(
      cart(beforeState, setErrorPasswordUpdate(beforeState, false))
    ).toEqual(anotherAfterState)
  })
})
