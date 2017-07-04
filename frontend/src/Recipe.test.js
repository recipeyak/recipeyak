import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

import Recipe from './Recipe.jsx'

describe('<Recipe/>', () => {
  it('renders without failure', () => {
    mount(<MemoryRouter><Recipe/></MemoryRouter>)
  })
})
