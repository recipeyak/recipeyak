import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './components/App.jsx'

import store from './store/store.js'

import './grid.scss'

const rootElement = document.getElementById('root')

if (rootElement != null) {
  render(
    <Provider store={ store }>
      <App />
    </Provider>,
    rootElement
  )
} else {
  console.error('error finding root element')
}
