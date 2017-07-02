import React from 'react';
import ReactDOM from 'react-dom'
import {MemoryRouter} from 'react-router'

import Home from './Home.jsx';

describe('<Home/>', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<MemoryRouter><Home/></MemoryRouter>, div)
  })
})
