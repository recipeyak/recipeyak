import React from 'react'
import {MemoryRouter} from 'react-router'
import {mount, shallow} from 'enzyme'

import Recipe from './Recipe.jsx'

describe('<Recipe/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><Recipe/></MemoryRouter>)
  })
  it('has the correct props', () => {
    const element = mount(<MemoryRouter><Recipe/></MemoryRouter>)
  })
})
