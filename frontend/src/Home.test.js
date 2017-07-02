import React from 'react'
import {shallow} from 'enzyme'

import Home from './Home.jsx';

describe('<Home/>', () => {
  it('renders without crashing', () => {
    shallow(<Home/>)
  })
  it('Has some text in footer', () => {
    const home = shallow(<Home/>)
    expect(home.find('footer').text()).toEqual('Caena ※ 2017')
  })
})
