import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

import Home from './Home.jsx'

describe('<Home/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><Home/></MemoryRouter>)
  })
  it('Has some text in footer', () => {
    const home = mount(<MemoryRouter><Home/></MemoryRouter>)
    expect(home.find('footer').text()).toEqual('Recipe Yak ※ 2017')
  })
})
