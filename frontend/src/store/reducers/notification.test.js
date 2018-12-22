import notification from "./notification.js"

import { setNotification, clearNotification } from "../actions"

describe("Notification", () => {
  it("Sets notification settings", () => {
    const beforeState = {
      message: ""
    }

    const action = {
      message: "testing",
      closeable: true
    }

    const afterState = {
      message: "testing",
      closeable: true,
      show: true
    }

    expect(notification(beforeState, setNotification(action))).toEqual(
      afterState
    )
  })
  it("clears notification", () => {
    const beforeState = {
      message: "testing",
      closeable: true,
      show: true
    }

    const afterState = {
      message: "",
      closeable: false,
      show: false
    }

    expect(notification(beforeState, clearNotification())).toEqual(afterState)
  })
})
