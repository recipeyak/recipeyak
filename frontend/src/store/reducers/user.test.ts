import user, {
  ISocialConnection,
  IUserState,
  IUser
} from "@/store/reducers/user"

import * as a from "@/store/reducers/user"

describe("fetchingUser", () => {
  it("#request: sets loading, removes failures", () => {
    const beforeState = {
      loading: false,
      error: true
    } as IUserState
    const expected = {
      loading: true,
      error: false
    } as IUserState
    expect(user(beforeState, a.fetchUser.request())).toEqual(expected)
  })
  it("#success: updates user, sets loading, sets loggedIn", () => {
    const beforeState = {
      loading: true,
      error: false,
      updatingEmail: false
    } as IUserState

    const userPayload = {
      avatar_url: "example.com",
      email: "j.doe@example.com",
      id: 123,
      has_usable_password: true,
      dark_mode_enabled: true,
      selected_team: 456
    } as IUser

    const expected = {
      id: userPayload.id,
      loggedIn: true,
      avatarURL: userPayload.avatar_url,
      email: userPayload.email,
      loading: false,
      updatingEmail: false,
      error: false,
      darkMode: true,
      hasUsablePassword: true,
      teamID: userPayload.selected_team
    }
    expect(user(beforeState, a.fetchUser.success(userPayload))).toEqual(
      expected
    )
    expect(user(beforeState, a.login(userPayload))).toEqual(expected)
  })
  it("#failure: sets loading, sets error", () => {
    const beforeState = {
      loading: true,
      error: false
    } as IUserState
    const expected = {
      loading: false,
      error: true
    } as IUserState
    expect(user(beforeState, a.fetchUser.failure())).toEqual(expected)
  })
})

describe("User", () => {
  it("sets user to logging out", () => {
    const beforeState = {
      loggingOut: false
    }

    const afterState = {
      loggingOut: true
    }

    expect(user(beforeState as IUserState, a.setLoggingOut(true))).toEqual(
      afterState
    )
  })

  it("toggles darkmode", () => {
    const beforeState = {
      darkMode: false
    }

    const afterState = {
      darkMode: true
    }

    expect(user(beforeState as IUserState, a.toggleDarkMode())).toEqual(
      afterState
    )
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

    expect(
      user(beforeState as IUserState, a.setSocialConnections(data))
    ).toEqual(afterState)

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

    expect(
      user(afterState as IUserState, a.setSocialConnections(data2))
    ).toEqual(afterState2)
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

    expect(
      user(beforeState as IUserState, a.setSocialConnections(data))
    ).toEqual(afterState)
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
      user(
        beforeState as IUserState,
        a.setSocialConnection({ provider, val: null })
      )
    ).toEqual(expected)
  })

  it("should set user logged in", () => {
    const beforeState = {
      loggedIn: true
    }
    const afterState = {
      loggedIn: false
    }
    expect(user(beforeState as IUserState, a.setUserLoggedIn(false))).toEqual(
      afterState
    )
  })
})
