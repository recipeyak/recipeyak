import Raven from 'raven-js'
import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux'

import { SENTRY_URL } from './settings'

import App from './components/App.jsx'

import store from './store/store.js'

if (process.env.NODE_ENV === 'production') {
  Raven.config(SENTRY_URL).install()
}

const rootElement = document.getElementById('root')
if (rootElement == null) {
  throw new Error('could not find root element')
}

render(
  <AppContainer>
    <Provider store={ store }>
      <App />
    </Provider>
  </AppContainer>,
  rootElement
)

if (module.hot) {
  module.hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default
    render(
      <AppContainer>
        <Provider store={ store }>
          <NextApp/>
        </Provider>
      </AppContainer>,
      rootElement
    )
  })
}
