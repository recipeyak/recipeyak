import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './App.jsx'

import store from './store.js'

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
  console.log('error finding root element')
}
