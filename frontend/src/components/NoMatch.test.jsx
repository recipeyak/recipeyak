import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
import NoMatch from './NoMatch.jsx'

describe('<NoMatch/>', () => {
  it('renders without failure', () => {
    mount(<MemoryRouter><NoMatch/></MemoryRouter>)
  })
})
