import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

import SearchBox from './SearchBox.jsx'

describe('<SearchBox/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><SearchBox/></MemoryRouter>)
  })
})
