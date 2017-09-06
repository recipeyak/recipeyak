import React from 'react'
import { MemoryRouter, Route } from 'react-router'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'

import LoginSignup from './containers/LoginSignup.jsx'

import { emptyStore as store } from './store.js'

describe('<LoginSignup/>', () => {
  it('renders login', () => {
    const element = mount(
      <Provider store={ store }>
        <MemoryRouter initialEntries={[ '/login' ]} initialIndex={1}>
          <Route path="/login" component={LoginSignup}/>
        </MemoryRouter>
      </Provider>)
    expect(element.text()).toContain('Email')
    expect(element.text()).toContain('Password')
  })

  it('renders signup', () => {
    const element = mount(
      <Provider store={ store }>
        <MemoryRouter initialEntries={[ '/signup' ]} initialIndex={1}>
          <Route path="/signup" component={LoginSignup}/>
        </MemoryRouter>
      </Provider>)
    expect(element.text()).toContain('Email')
    expect(element.text()).toContain('Password')
    expect(element.text()).toContain('Password Again')
  })
})
