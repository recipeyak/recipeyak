import Raven from 'raven-js'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { SENTRY_DSN } from './settings'

import App from './components/App.jsx'

import store from './store/store.js'

if (process.env.NODE_ENV === 'production') {
  Raven.config(SENTRY_DSN).install()
}

const rootElement = document.getElementById('root')
if (rootElement == null) {
  throw new Error('could not find root element')
}

render(
  <Provider store={ store }>
    <App />
  </Provider>,
  rootElement
)
