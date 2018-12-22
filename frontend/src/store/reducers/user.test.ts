import user, { ISocialConnection } from "./user"

import {
  login,
  setAvatarURL,
  setUserEmail,
  setLoadingUser,
  setSocialConnections,
  setErrorUser,
  setUpdatingUserEmail,
  setLoggingOut,
  setPasswordUsable,
  toggleDarkMode,
  setSocialConnection,
  setUserID,
  setUserLoggedIn,
  setScheduleURL
} from "../actions"

describe("User", () => {
  it("Logs in user adding token", () => {
    const beforeState = {
      loggedIn: false
    }

    const avatarURL = "//www.user.com"
    const email = "test@gmail.com"
    const id = 15

    const userData = {
      avatar_url: avatarURL,
      email,
      id,
      has_usable_password: true
    }

    const afterState = {
      loggedIn: true,
      avatarURL,
      id,
      hasUsablePassword: true,
      email
    }

    expect(user(beforeState as any, login(userData))).toEqual(afterState)
  })

  it("Updates user passwordStatus", () => {
    const beforeState = {
      loggedIn: true,
      token: "123456",
      avatarURL: "example.com/image",
      hasUsablePassword: false
    }

    const afterState = {
      loggedIn: true,
      token: "123456",
      avatarURL: "example.com/image",
      hasUsablePassword: true
    }

    expect(user(beforeState as any, setPasswordUsable(true))).toEqual(
      afterState
    )
  })

  it("sets user's avatarURL", () => {
    const beforeState = {
      avatarURL: ""
    }

    const avatarURL = "http//"

    const afterState = {
      avatarURL
    }

    expect(user(beforeState as any, setAvatarURL(avatarURL))).toEqual(
      afterState
    )
  })

  it("sets user's email", () => {
    const beforeState = {
      email: ""
    }

    const email = "j@example.com"

    const afterState = {
      email
    }

    expect(user(beforeState as any, setUserEmail(email))).toEqual(afterState)
  })

  it("sets loading state of user", () => {
    const beforeState = {
      loading: false
    }

    const afterState = {
      loading: true
    }

    expect(user(beforeState as any, setLoadingUser(true))).toEqual(afterState)
  })

  it("sets error state of user", () => {
    const beforeState = {
      error: false
    }

    const afterState = {
      error: true
    }

    expect(user(beforeState as any, setErrorUser(true))).toEqual(afterState)
  })

  it("sets updating user email correctly", () => {
    const beforeState = {
      updatingEmail: false
    }

    const afterState = {
      updatingEmail: true
    }

    expect(user(beforeState as any, setUpdatingUserEmail(true))).toEqual(
      afterState
    )
  })

  it("sets user to logging out", () => {
    const beforeState = {
      loggingOut: false
    }

    const afterState = {
      loggingOut: true
    }

    expect(user(beforeState as any, setLoggingOut(true))).toEqual(afterState)
  })

  it("toggles darkmode", () => {
    const beforeState = {
      darkMode: false
    }

    const afterState = {
      darkMode: true
    }

    expect(user(beforeState as any, toggleDarkMode())).toEqual(afterState)
  })

  it("sets social connections", () => {
    const beforeState = {
      socialAccountConnections: {
        github: null,
        gitlab: null
      }
    }

    const data: ISocialConnection[] = [
      {
        id: 2,
        provider: "gitlab",
        uid: "123456",
        last_login: "2018-01-26T17:02:24.513169Z",
        date_joined: "2018-01-26T17:02:24.513228Z"
      }
    ]

    const afterState = {
      socialAccountConnections: {
        github: null,
        gitlab: 2
      }
    }

    expect(user(beforeState as any, setSocialConnections(data))).toEqual(
      afterState
    )

    const data2: ISocialConnection[] = [
      {
        id: 4,
        provider: "github",
        uid: "56789",
        last_login: "2018-01-26T17:02:24.513169Z",
        date_joined: "2018-01-26T17:02:24.513228Z"
      }
    ]

    const afterState2 = {
      socialAccountConnections: {
        github: 4,
        gitlab: 2
      }
    }

    expect(user(afterState as any, setSocialConnections(data2))).toEqual(
      afterState2
    )
  })

  it("handles multiple responses", () => {
    const beforeState = {
      socialAccountConnections: {
        github: null,
        gitlab: null
      }
    }

    const afterState = {
      socialAccountConnections: {
        github: 4,
        gitlab: 6
      }
    }

    const data: ISocialConnection[] = [
      {
        id: 4,
        provider: "github",
        uid: "56789",
        last_login: "2018-01-26T17:02:24.513169Z",
        date_joined: "2018-01-26T17:02:24.513228Z"
      },
      {
        id: 6,
        provider: "gitlab",
        uid: "123456",
        last_login: "2018-01-26T17:02:24.513169Z",
        date_joined: "2018-01-26T17:02:24.513228Z"
      }
    ]

    expect(user(beforeState as any, setSocialConnections(data))).toEqual(
      afterState
    )
  })

  it("sets social connection", () => {
    const beforeState = {
      socialAccountConnections: {
        github: 4,
        gitlab: 7
      }
    }

    const expected = {
      socialAccountConnections: {
        github: 4,
        gitlab: null
      }
    }

    const provider = "gitlab"

    expect(
      user(beforeState as any, setSocialConnection(provider, null))
    ).toEqual(expected)
  })

  it("sets user's id", () => {
    const beforeState = {}

    const id = 2

    const afterState = {
      id
    }

    expect(user(beforeState as any, setUserID(id))).toEqual(afterState)
  })
  it("should set user logged in", () => {
    const beforeState = {
      loggedIn: true
    }
    const afterState = {
      loggedIn: false
    }
    expect(user(beforeState as any, setUserLoggedIn(false))).toEqual(afterState)
  })

  it("should set schedule url", () => {
    const url = "/schedule/something-not-the-default-value"
    expect(user(undefined, setScheduleURL(url)).scheduleURL).toEqual(url)
  })
})
