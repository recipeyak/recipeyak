import React from "react"
import { mount } from "enzyme"
import ErrorBoundary from "@/components/ErrorBoundary"

describe("<ListItem/>", () => {
  // SOURCE: https://github.com/facebook/react/issues/11098#issuecomment-370614347
  beforeEach(() => {
    jest.spyOn(console, "error")
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    // tslint:disable-next-line:no-any
    ;((global.console.error as any) as jest.SpyInstance).mockImplementation(
      /* eslint-enable @typescript-eslint/consistent-type-assertions */
      jest.fn()
    )
  })
  afterEach(() => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    // tslint:disable-next-line:no-any
    ;((global.console.error as any) as jest.SpyInstance).mockRestore()
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  })

  it("renders without crashing", () => {
    mount(
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    )
  })

  function BadComponent() {
    // NOTE(chdsbd): We need to throw for the error boundary to trigger
    // tslint:disable-next-line:no-throw
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
