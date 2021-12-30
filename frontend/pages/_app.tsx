import type { AppProps } from 'next/app'
import Raven from "raven-js"
import React from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"

import { SENTRY_DSN, GIT_SHA } from "@/settings"

import App from "@/components/App"

import store from "@/store/store"
import { ThemeProvider, theme } from "@/theme"

import "@/components/scss/main.scss"


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </ThemeProvider>
  )
}

export default MyApp
