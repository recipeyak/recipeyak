import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import registerServiceWorker from './registerServiceWorker'
import './grid.scss'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
