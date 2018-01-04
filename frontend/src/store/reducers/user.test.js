import user from './user.js'

import {
  logout,
  login,
  setAvatarURL,
  setUserEmail,
  setLoadingUser,
  setErrorUser,
  setUpdatingUserEmail,
  setLoggingOut,
  toggleDarkMode
} from '../actions.js'

describe('User', () => {
  it('Logs in user adding token', () => {
    const beforeState = {
      loggedIn: false
    }

    const token = 'afakekey'
    const avatar_url = '//www.user.com'
    const email = 'test@gmail.com'

    const user_data = {
      avatar_url,
      email
    }

    const afterState = {
      loggedIn: true,
      token,
      avatarURL: avatar_url,
      email
    }

    expect(
      user(beforeState, login(token, user_data))
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

  it('sets loading state of user', () => {
    const beforeState = {
      loading: false
    }

    const afterState = {
      loading: true
    }

    expect(
      user(beforeState, setLoadingUser(true))
    ).toEqual(afterState)
  })

  it('sets error state of user', () => {
    const beforeState = {
      error: false
    }

    const afterState = {
      error: true
    }

    expect(
      user(beforeState, setErrorUser(true))
    ).toEqual(afterState)
  })

  it('sets updating user email correctly', () => {
    const beforeState = {
      updatingEmail: false
    }

    const afterState = {
      updatingEmail: true
    }

    expect(
      user(beforeState, setUpdatingUserEmail(true))
    ).toEqual(afterState)
  })

  it('sets user to logging out', () => {
    const beforeState = {
      loggingOut: false
    }

    const afterState = {
      loggingOut: true
    }

    expect(
      user(beforeState, setLoggingOut(true))
    ).toEqual(afterState)
  })


  it('toggles darkmode', () => {
    const beforeState = {
      darkMode: false
    }

    const afterState = {
      darkMode: true
    }

    expect(
      user(beforeState, toggleDarkMode())
    ).toEqual(afterState)
  })
})
