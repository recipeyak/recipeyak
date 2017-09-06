import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

import PasswordReset from './PasswordReset.jsx'

describe('<PasswordReset/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><PasswordReset/></MemoryRouter>)
  })
})
