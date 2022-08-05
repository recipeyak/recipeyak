import notification, {
  clearNotification,
  initialState,
  setNotification,
} from "@/store/reducers/notification"

describe("Notification", () => {
  it("Sets notification settings", () => {
    const beforeState = {
      ...initialState,
      message: "",
    }

    const action = {
      message: "testing",
      closeable: true,
    }

    const afterState = {
      ...initialState,
      message: "testing",
      closeable: true,
      show: true,
    }

    expect(notification(beforeState, setNotification(action))).toEqual(
      afterState,
    )
  })
  it("clears notification", () => {
    const beforeState = {
      ...initialState,
      message: "testing",
      closeable: true,
      show: true,
    }

    const afterState = {
      ...initialState,
      message: "",
      closeable: false,
      show: false,
    }

    expect(notification(beforeState, clearNotification())).toEqual(afterState)
  })
})
