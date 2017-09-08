import loading from './loading.js'
import {
  setLoadingLogin,
  setLoadingSignup,
  setLoadingReset,
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

  it('sets loading reset', () => {
    const notLoadingState = {
      reset: false,
    }

    const loadingState = {
      reset: true,
    }

    expect(
      loading(notLoadingState, setLoadingReset(true))
      ).toEqual(loadingState)

    expect(
      loading(loadingState, setLoadingReset(false))
      ).toEqual(notLoadingState)
  })
})
