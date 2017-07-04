import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount, shallow } from 'enzyme'

import PasswordReset from './PasswordReset.jsx'

describe('<PasswordReset/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><PasswordReset/></MemoryRouter>)
  })
  it('has the correct props', () => {
    const element = mount(<MemoryRouter><PasswordReset/></MemoryRouter>)
  })
})
