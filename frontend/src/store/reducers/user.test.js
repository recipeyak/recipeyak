import user from './user.js'

import {
  logout,
  login,
  setAvatarURL,
  setUserEmail
} from '../actions.js'

describe('User', () => {
  it('Logs in user adding token', () => {
    const beforeState = {
      loggedIn: false
    }

    const token = 'afakekey'

    const afterState = {
      loggedIn: true,
      token
    }

    expect(
      user(beforeState, login(token))
    ).toEqual(afterState)
  })

  it('Logs out user', () => {
    const token = 'afakekey'
    const beforeState = {
      loggedIn: true,
      token
    }

    const afterState = {
      loggedIn: false,
      token: null
    }

    expect(
      user(beforeState, logout())
    ).toEqual(afterState)
  })

  it("sets user's avatarURL", () => {
    const beforeState = {
      avatarURL: ''
    }

    const avatarURL = 'http//'

    const afterState = {
      avatarURL
    }

    expect(
      user(beforeState, setAvatarURL(avatarURL))
    ).toEqual(afterState)
  })

  it("sets user's email", () => {
    const beforeState = {
      email: ''
    }

    const email = 'j@example.com'

    const afterState = {
      email
    }

    expect(
      user(beforeState, setUserEmail(email))
    ).toEqual(afterState)
  })
})
