import auth from "./auth"

import { setFromUrl } from "../actions.js"

describe("auth", () => {
  it("sets redirect url", () => {
    const beforeState = {
      fromUrl: ""
    }

    const fromUrl = "/recipes/15?test#1234"

    const afterState = {
      fromUrl
    }

    expect(auth(beforeState, setFromUrl(fromUrl))).toEqual(afterState)
  })
})
