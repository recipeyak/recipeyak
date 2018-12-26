import auth, { IAuthState } from "@/store/reducers/auth"

import * as a from "@/store/reducers/auth"

describe("auth", () => {
  it("sets redirect url", () => {
    const beforeState = {
      fromUrl: ""
    }

    const fromUrl = "/recipes/15?test#1234"

    const afterState: IAuthState = {
      fromUrl
    }

    expect(auth(beforeState, a.setFromUrl(fromUrl))).toEqual(afterState)
  })
})
