import { expect, test, it, describe } from "vitest"
import auth, {
  IAuthState,
  initialState,
  setFromUrl,
} from "@/store/reducers/auth"

describe("auth", () => {
  it("sets redirect url", () => {
    const beforeState = {
      ...initialState,
      fromUrl: "",
    }

    const fromUrl = "/recipes/15?test#1234"

    const afterState: IAuthState = {
      ...initialState,
      fromUrl,
    }

    expect(auth(beforeState, setFromUrl(fromUrl))).toEqual(afterState)
  })
})
