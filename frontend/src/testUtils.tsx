import React from "react"
import { Provider as ReduxProvider } from "react-redux"
import { DndProvider } from "react-dnd"
import { MemoryRouter } from "react-router"
import HTML5Backend from "react-dnd-html5-backend"

import { emptyStore as store } from "@/store/store"
import { getCmd } from "redux-loop"
import { ThemeProvider, theme } from "@/theme"

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

export const TestProvider: React.FC = ({ children }) => (
  <ThemeProvider theme={theme}>
    <ReduxProvider store={store}>
      <MemoryRouter>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </MemoryRouter>
    </ReduxProvider>
  </ThemeProvider>
)
