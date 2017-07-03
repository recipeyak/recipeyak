import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import registerServiceWorker from './registerServiceWorker'
import './grid.scss'

import { Provider } from 'mobx-react'
import store from './store.js'

ReactDOM.render(
  <Provider store={ store }>
    <App />
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
