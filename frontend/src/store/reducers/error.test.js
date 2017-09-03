import error from './error.js'
import {
  setErrorLogin,
} from '../actions.js'

describe('error', () => {
  it('sets login error', () => {
    const notErrorState = {
      login: false,
    }

    const errorState = {
      login: true,
    }

    expect(
      error(notErrorState, setErrorLogin(true))
      ).toEqual(errorState)

    expect(
      error(errorState, setErrorLogin(false))
      ).toEqual(notErrorState)
  })
})
