import React from "react"
import { Navbar } from "@/components/Nav"
import { TestProvider } from "@/testUtils"
import renderer from "react-test-renderer"
import { createEmptyStore } from "@/store/store"

describe("<Nav/>", () => {
  it("renders default", () => {
    const tree = renderer.create(
      <TestProvider>
        <Navbar />
      </TestProvider>
    )
    expect(tree).toMatchSnapshot()
  })

  test("render when logged in", () => {
    const emptyState = createEmptyStore().getState()
    const store = createEmptyStore({
      ...emptyState,
      user: {
        ...emptyState.user,
        loggedIn: true
      }
    })
    const tree = renderer.create(
      <TestProvider store={store}>
        <Navbar />
      </TestProvider>
    )
    expect(tree).toMatchSnapshot()
  })
})
