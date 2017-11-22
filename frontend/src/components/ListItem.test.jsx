import React from 'react'

import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

import { MemoryRouter } from 'react-router'

import ListItem from './ListItem.jsx'

describe('<ListItem/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><ListItem/></MemoryRouter>)
  })
})
