import React from 'react'
import { MemoryRouter } from 'react-router'

import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

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
