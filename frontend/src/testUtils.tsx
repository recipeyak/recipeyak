import { expect } from "vitest"
import { getCmd } from "redux-loop"

export function assertCmdFuncEq<T, F>(state: T, expected: F) {
  const maybeCmd = getCmd(state)
  expect(maybeCmd).not.toBeNull()
  if (maybeCmd != null) {
    expect(maybeCmd.type).toEqual("RUN")
    if (maybeCmd.type === "RUN") {
      expect(maybeCmd.func).toEqual(expected)
    }
  }
}
