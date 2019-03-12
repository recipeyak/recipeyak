import user, { IUserState, IUser } from "@/store/reducers/user"

import * as a from "@/store/reducers/user"
import { login } from "@/store/reducers/auth"

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
    expect(user(beforeState, login.success(userPayload))).toEqual(expected)
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

    expect(user(beforeState as IUserState, a.logOut.request())).toEqual(
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
