import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

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
