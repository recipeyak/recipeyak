import loading from './loading.js'
import {
  setLoadingLogin,
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
})
