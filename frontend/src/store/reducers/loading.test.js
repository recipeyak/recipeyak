import loading from './loading.js'
import {
  loadingLogin,
} from '../actions.js'

describe('loading', () => {
  it('Adds recipe to recipe list', () => {
    const notLoadingState = {
      login: false,
    }

    const loadingState = {
      login: true,
    }

    expect(
      loading(notLoadingState, loadingLogin(true))
      ).toEqual(loadingState)

    expect(
      loading(loadingState, loadingLogin(false))
      ).toEqual(notLoadingState)
  })
})
