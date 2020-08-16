import React from "react"
import { Provider as ReduxProvider } from "react-redux"
import { DndProvider } from "react-dnd"
import { MemoryRouter } from "react-router"
import HTML5Backend from "react-dnd-html5-backend"
import MockDate from "mockdate"
import { Store, createEmptyStore } from "@/store/store"
import { getCmd } from "redux-loop"
import { ThemeProvider, theme } from "@/theme"
import { baseHttp } from "@/http"
import MockAdapter from "axios-mock-adapter"
import timezoneMock, { TimeZone } from "timezone-mock"

export const mockDate = MockDate

export function createHttpMocker() {
  return new MockAdapter(baseHttp)
}

export function mockTimezone(timezone: TimeZone, cb: () => void) {
  timezoneMock.register(timezone)
  cb()
  timezoneMock.unregister()
}

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

interface ITestProviderProps {
  readonly store?: Store
}

export const TestProvider: React.FC<ITestProviderProps> = ({
  children,
  store,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <ReduxProvider store={store || createEmptyStore()}>
        <MemoryRouter>
          <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </MemoryRouter>
      </ReduxProvider>
    </ThemeProvider>
  )
}
