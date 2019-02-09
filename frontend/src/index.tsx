import Raven from "raven-js"
import React from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"

import { SENTRY_DSN, GIT_SHA } from "@/settings"

import App from "@/components/App"

import store from "@/store/store"

if (process.env.NODE_ENV === "production" && SENTRY_DSN) {
  Raven.config(SENTRY_DSN, {
    release: GIT_SHA || ""
  }).install()
  // tslint:disable-next-line:no-console
  console.log("version:", GIT_SHA, "\nsentry:", SENTRY_DSN)
}

const rootElement = document.getElementById("root")
if (rootElement == null) {
  // This is an exceptional case that we should throw about. Nothing can handle
  // this error.
  // tslint:disable-next-line:no-throw
  throw new Error("could not find root element")
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
