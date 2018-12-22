import auth, { IAuthState } from "./auth"

import { setFromUrl } from "../actions"

describe("auth", () => {
  it("sets redirect url", () => {
    const beforeState = {
      fromUrl: ""
    }

    const fromUrl = "/recipes/15?test#1234"

    const afterState: IAuthState = {
      fromUrl
    }

    expect(auth(beforeState, setFromUrl(fromUrl))).toEqual(afterState)
  })
})
