import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

import NoMatch from './NoMatch.jsx'

describe('<NoMatch/>', () => {
  it('renders without failure', () => {
    mount(<MemoryRouter><NoMatch/></MemoryRouter>)
  })
})
