import user, {
  fetchUser,
  IUser,
  IUserState,
  setUserLoggedIn,
} from "@/store/reducers/user"

/* eslint-disable @typescript-eslint/consistent-type-assertions */
describe("fetchingUser", () => {
  it("#request: sets loading, removes failures", () => {
    const beforeState = {
      loading: false,
      error: true,
    } as IUserState
    const expected = {
      loading: true,
      error: false,
    } as IUserState
    expect(user(beforeState, fetchUser.request())).toEqual(expected)
  })
  it("#success: updates user, sets loading, sets loggedIn", () => {
    const beforeState = {
      loading: true,
      error: false,
      updatingEmail: false,
    } as IUserState

    const userPayload: IUser = {
      avatar_url: "example.com",
      email: "j.doe@example.com",
      id: 123,
      dark_mode_enabled: true,
      name: "",
      schedule_team: null,
    }

    const expected = {
      id: userPayload.id,
      loggedIn: true,
      avatarURL: userPayload.avatar_url,
      email: userPayload.email,
      loading: false,
      updatingEmail: false,
      error: false,
      hasUsablePassword: true,
      scheduleTeamID: null,
      name: "",
    }
    expect(user(beforeState, fetchUser.success(userPayload))).toEqual(expected)
  })
  it("#failure: sets loading, sets error", () => {
    const beforeState = {
      loading: true,
      error: false,
    } as IUserState
    const expected = {
      loading: false,
      error: true,
    } as IUserState
    expect(user(beforeState, fetchUser.failure())).toEqual(expected)
  })
})

describe("User", () => {
  it("should set user logged in", () => {
    const beforeState = {
      loggedIn: true,
    }
    const afterState = {
      loggedIn: false,
    }
    expect(user(beforeState as IUserState, setUserLoggedIn(false))).toEqual(
      afterState,
    )
  })
})
