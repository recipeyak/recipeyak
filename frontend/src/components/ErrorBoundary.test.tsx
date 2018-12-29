import React from "react"
import { mount } from "enzyme"
import ErrorBoundary from "@/components/ErrorBoundary"

describe("<ListItem/>", () => {
  beforeEach(() => {
    jest.spyOn(console, "error")
    // tslint:disable-next-line:no-any
    ;((global.console.error as any) as jest.SpyInstance).mockImplementation(
      jest.fn()
    )
  })
  afterEach(() => {
    // tslint:disable-next-line:no-any
    ;((global.console.error as any) as jest.SpyInstance).mockRestore()
  })

  it("renders without crashing", () => {
    mount(
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    )
  })

  function BadComponent() {
    throw Error()
    return null
  }
  it("renders error without crashing", () => {
    mount(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>
    )
  })
})
