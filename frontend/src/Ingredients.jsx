import React from 'react'
import './print-list.scss'

// NOTE: For development purposes only
import { ingredients } from './mockup-data.js'
let text = ingredients.join('\n')
for (let i = 0; i < 3; i++) {
  text += text
}

class Ingredients extends React.Component {
  render () {
    return (<div className="print-list">{ text }</div>)
  }
}

export default Ingredients
