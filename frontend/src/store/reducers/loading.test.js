import loading from './loading.js'
import {
  setLoadingLogin,
  setLoadingSignup,
} from '../actions.js'

describe('loading', () => {
  it('sets loading login', () => {
    const notLoadingState = {
      login: false,
    }

    const loadingState = {
      login: true,
    }

    expect(
      loading(notLoadingState, setLoadingLogin(true))
      ).toEqual(loadingState)

    expect(
      loading(loadingState, setLoadingLogin(false))
      ).toEqual(notLoadingState)
  })

  it('sets loading signup', () => {
    const notLoadingState = {
      signup: false,
    }

    const loadingState = {
      signup: true,
    }

    expect(
      loading(notLoadingState, setLoadingSignup(true))
      ).toEqual(loadingState)

    expect(
      loading(loadingState, setLoadingSignup(false))
      ).toEqual(notLoadingState)
  })
})
