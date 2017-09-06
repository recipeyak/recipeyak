import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { emptyStore as store } from './store.js'

import App from './App'

describe('<App/>', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(
      <Provider store={ store }>
        <App />
      </Provider>
     , div)
  })
})
