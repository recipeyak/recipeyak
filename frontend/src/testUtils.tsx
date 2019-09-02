import React from "react"
import { Provider } from "react-redux"
import { DndProvider } from "react-dnd"
import { MemoryRouter } from "react-router"
import HTML5Backend from "react-dnd-html5-backend"

import { emptyStore as store } from "@/store/store"
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

export class DndTestContext extends React.Component {
  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <MemoryRouter>{this.props.children}</MemoryRouter>
        </Provider>
      </DndProvider>
    )
  }
}
