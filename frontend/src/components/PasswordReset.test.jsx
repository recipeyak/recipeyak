import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

import PasswordReset from './PasswordReset.jsx'

describe('<PasswordReset/>', () => {
  it('renders without crashing', () => {
    const props = {
      error: {},
      loading: false,
      reset: () => console.log('test')
    }
    mount(<MemoryRouter><PasswordReset {...props}/></MemoryRouter>)
  })
})
