import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

import Nav from './Nav.jsx'

describe('<Nav/>', () => {
  it('renders without failure', () => {
    mount(<MemoryRouter><Nav/></MemoryRouter>)
  })
})
