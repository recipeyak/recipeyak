import React from 'react'
import { MemoryRouter, Route } from 'react-router'
import { mount } from 'enzyme'

import LoginSignup from './LoginSignup.jsx'

describe('<LoginSignup/>', () => {
  it('renders login', () => {
    const element = mount(
      <MemoryRouter initialEntries={[ '/login' ]} initialIndex={1}>
        <Route path="/login" render={LoginSignup}/>
      </MemoryRouter>)
    expect(element.text()).toContain('Email')
    expect(element.text()).toContain('Password')
  })
  it('renders signup', () => {
    const element = mount(
      <MemoryRouter initialEntries={[ '/signup' ]} initialIndex={1}>
        <Route path="/signup" render={LoginSignup}/>
      </MemoryRouter>
    )
    expect(element.text()).toContain('Email')
    expect(element.text()).toContain('Password')
    expect(element.text()).toContain('Password Again')
  })
})
