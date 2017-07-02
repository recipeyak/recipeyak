import React from 'react';
import ReactDOM from 'react-dom'
import {MemoryRouter} from 'react-router'

import Ingredients from './Ingredients.jsx'

describe('<Ingredients/>', () => {
  it('renders without crashing', () => {
    const ingredients = ['onion', 'tomato', 'potato']
    const div = document.createElement('div')
    ReactDOM.render(<MemoryRouter><Ingredients ingredients={ingredients}/></MemoryRouter>, div)
  })
  it('displays the ingredients correctly', () => {
    const ingredients = ['onion', 'tomato', 'potato']
    const div = document.createElement('div')
    ReactDOM.render(<MemoryRouter><Ingredients ingredients={ingredients}/></MemoryRouter>, div)
  })
})
