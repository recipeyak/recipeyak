import React from 'react'
import { mount } from 'enzyme'
import { MemoryRouter } from 'react-router'

import ListItem from './ListItem.jsx'

describe('<ListItem/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><ListItem/></MemoryRouter>)
  })
})
