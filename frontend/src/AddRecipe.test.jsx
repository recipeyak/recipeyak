import React from 'react'
import { mount } from 'enzyme'
import { MemoryRouter } from 'react-router'

import AddRecipe from './AddRecipe.jsx'

describe('<AddRecipe/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><AddRecipe/></MemoryRouter>)
  })
})
