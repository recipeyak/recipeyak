import React from "react"
import { mount } from "enzyme"
import PasswordReset from "@/components/PasswordReset"
import { TestProvider } from "@/testUtils"

describe("<PasswordReset/>", () => {
  it("renders without crashing", () => {
    const props = {
      error: {},
      loading: false,
      reset: () => Promise.resolve()
    }
    mount(
      <TestProvider>
        <PasswordReset loggedIn={false} {...props} />
      </TestProvider>
    )
  })
})
