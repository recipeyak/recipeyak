import React from 'react'
import { MemoryRouter, Route } from 'react-router'
import { Provider } from 'react-redux'

import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

import Login from './Login.jsx'

import { emptyStore as store } from '../store/store.js'

describe('<Login/>', () => {
  it('renders login', () => {
    const element = mount(
      <Provider store={ store }>
        <MemoryRouter initialEntries={[ '/login' ]} initialIndex={1}>
          <Route path="/login" component={Login}/>
        </MemoryRouter>
      </Provider>)
    expect(element.text()).toContain('Email')
    expect(element.text()).toContain('Password')
  })
})
