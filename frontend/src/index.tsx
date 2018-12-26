import Raven from "raven-js"
import React from "react"
import { render } from "react-dom"
import { AppContainer } from "react-hot-loader"
import { Provider } from "react-redux"

import { SENTRY_DSN, GIT_SHA } from "./settings"

import App from "./components/App"

import store from "./store/store"

if (process.env.NODE_ENV === "production" && SENTRY_DSN) {
  Raven.config(SENTRY_DSN, {
    release: GIT_SHA || ""
  }).install()
}

const rootElement = document.getElementById("root")
if (rootElement == null) {
  throw new Error("could not find root element")
}

render(
  <AppContainer>
    <Provider store={store}>
      <App />
    </Provider>
  </AppContainer>,
  rootElement
)

declare var module: {
  readonly hot?: {
    accept(str: string, f: () => void): void
  }
}

if (module.hot) {
  module.hot.accept("./components/App", () => {
    // tslint:disable:no-unsafe-any
    const NextApp = require("./components/App").default
    render(
      <AppContainer>
        <Provider store={store}>
          <NextApp />
        </Provider>
      </AppContainer>,
      rootElement
    )
    // tslint:enable:no-unsafe-any
  })
}
