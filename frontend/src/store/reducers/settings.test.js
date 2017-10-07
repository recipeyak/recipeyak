import settings from './settings.js'

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
      settings(beforeState, setLoadingPasswordUpdate(true))
    ).toEqual(afterState)

    const anotherAfterState = {
      loadingPasswordUpdate: false
    }

    expect(
      settings(beforeState, setLoadingPasswordUpdate(false))
    ).toEqual(anotherAfterState)
  })

  it('sets the error state of the updating password', () => {
    const beforeState = {}

    const afterState = {
      errorPasswordUpdate: true
    }

    expect(
      settings(beforeState, setErrorPasswordUpdate(true))
    ).toEqual(afterState)

    const anotherAfterState = {
      errorPasswordUpdate: false
    }

    expect(
      settings(beforeState, setErrorPasswordUpdate(false))
    ).toEqual(anotherAfterState)
  })
})
